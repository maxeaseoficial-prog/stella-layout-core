import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { COLLECTIONS, byKey, type CollectionDescriptor } from "./tableMap";

/**
 * Camada de sincronização multi-tenant.
 *
 * Estratégia: mantém localStorage como cache local síncrono (para todos
 * os módulos existentes continuarem funcionando sem mudança) e espelha
 * as mesmas coleções em tabelas Supabase com RLS por `tenant_id`.
 *
 * Fluxos:
 *  - Boot (`startSync`): baixa TODAS as coleções remotas e grava em
 *    localStorage, disparando os eventos custom que os hooks já escutam.
 *    Assina Realtime para receber alterações de outros usuários.
 *  - Escrita local: intercepta `window.localStorage.setItem` das chaves
 *    conhecidas e faz upsert/delete correspondente no Supabase.
 *  - Escrita remota (Realtime): refetcha a tabela inteira, grava em
 *    localStorage com flag de "aplicando remoto" (para não disparar o
 *    interceptador) e dispara os eventos custom.
 */

const TENANT_ID_DEFAULT = "11111111-1111-1111-1111-111111111111";

let started = false;
let currentTenantId: string | null = null;
let originalSetItem: ((key: string, value: string) => void) | null = null;
const channels: RealtimeChannel[] = [];
const applyingRemote = new Set<string>();     // storage keys sendo atualizadas pelo remoto
const lastSnapshot = new Map<string, string>(); // key -> JSON.stringify(último valor conhecido)

function dispatchEvents(desc: CollectionDescriptor) {
  if (typeof window === "undefined") return;
  desc.events.forEach((name) => window.dispatchEvent(new CustomEvent(name)));
}

function writeLocalSilent(key: string, value: string) {
  if (!originalSetItem) return;
  applyingRemote.add(key);
  try {
    originalSetItem.call(window.localStorage, key, value);
  } finally {
    applyingRemote.delete(key);
  }
}

async function fetchAndApply(desc: CollectionDescriptor, tenantId: string) {
  const { data, error } = await supabase
    .from(desc.table as never)
    .select("id,data")
    .eq("tenant_id" as never, tenantId as never);
  if (error) {
    console.error("[sync] fetch", desc.table, error);
    return;
  }
  const rows = (data ?? []) as Array<{ id: string; data: unknown }>;
  let value: string;
  if (desc.kind === "singleton") {
    const obj = rows[0]?.data ?? null;
    if (obj == null) {
      // não sobrescreve local: só descarta cache
      return;
    }
    value = JSON.stringify(obj);
  } else {
    const list = rows.map((r) => r.data);
    value = JSON.stringify(list);
  }
  if (lastSnapshot.get(desc.key) === value) return;
  lastSnapshot.set(desc.key, value);
  writeLocalSilent(desc.key, value);
  dispatchEvents(desc);
}

async function upsertCollection(
  desc: CollectionDescriptor,
  tenantId: string,
  nextValue: string,
) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(nextValue);
  } catch {
    return;
  }

  if (desc.kind === "singleton") {
    if (parsed == null) return;
    await supabase.from(desc.table as never).upsert(
      { id: tenantId, tenant_id: tenantId, data: parsed } as never,
      { onConflict: "id" } as never,
    );
    lastSnapshot.set(desc.key, nextValue);
    return;
  }

  if (!Array.isArray(parsed)) return;

  // Diff contra snapshot anterior
  const prev = safeParseArray(lastSnapshot.get(desc.key));
  const nextIds = new Set<string>();
  const upserts: Array<{ id: string; tenant_id: string; data: unknown }> = [];

  for (const item of parsed as Array<Record<string, unknown>>) {
    const id = item?.id as string | undefined;
    if (!id) continue;
    nextIds.add(id);
    upserts.push({ id, tenant_id: tenantId, data: item });
  }

  const toDelete: string[] = [];
  for (const item of prev) {
    const id = (item as Record<string, unknown>)?.id as string | undefined;
    if (id && !nextIds.has(id)) toDelete.push(id);
  }

  // Executa
  if (upserts.length > 0) {
    // Compara valores para evitar upsert desnecessário
    const changed = upserts.filter((u) => {
      const prevItem = prev.find(
        (p) => (p as Record<string, unknown>).id === u.id,
      );
      return !prevItem || JSON.stringify(prevItem) !== JSON.stringify(u.data);
    });
    if (changed.length > 0) {
      await supabase
        .from(desc.table as never)
        .upsert(changed as never, { onConflict: "id" } as never);
    }
  }
  if (toDelete.length > 0) {
    await supabase
      .from(desc.table as never)
      .delete()
      .in("id" as never, toDelete as never);
  }

  lastSnapshot.set(desc.key, nextValue);
}

function safeParseArray(s: string | undefined): unknown[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function installSetItemInterceptor(tenantId: string) {
  if (originalSetItem) return;
  originalSetItem = window.localStorage.setItem.bind(window.localStorage);
  window.localStorage.setItem = function (key: string, value: string) {
    originalSetItem!.call(window.localStorage, key, value);
    const desc = byKey(key);
    if (!desc) return;
    if (applyingRemote.has(key)) return;
    // dispara upsert em background
    void upsertCollection(desc, tenantId, value).catch((err) =>
      console.error("[sync] upsert", desc.table, err),
    );
  } as typeof window.localStorage.setItem;
}

function uninstallSetItemInterceptor() {
  if (!originalSetItem) return;
  window.localStorage.setItem = originalSetItem;
  originalSetItem = null;
}

function subscribeRealtime(desc: CollectionDescriptor, tenantId: string) {
  const ch = supabase
    .channel(`sync-${desc.table}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: desc.table,
        filter: `tenant_id=eq.${tenantId}`,
      },
      () => {
        void fetchAndApply(desc, tenantId);
      },
    )
    .subscribe();
  channels.push(ch);
}

export async function startSync(tenantId: string = TENANT_ID_DEFAULT) {
  if (started) return;
  started = true;
  currentTenantId = tenantId;

  installSetItemInterceptor(tenantId);

  // 1. Baixa tudo em paralelo e aplica em localStorage
  await Promise.all(COLLECTIONS.map((c) => fetchAndApply(c, tenantId)));

  // 2. Sobe qualquer dado local que ainda não esteja no remoto
  //    (importação incremental automática — cobre migração inicial)
  for (const desc of COLLECTIONS) {
    const local = window.localStorage.getItem(desc.key);
    if (local == null) continue;
    const remote = lastSnapshot.get(desc.key);
    if (remote === local) continue;
    // Se ainda não há dado remoto, sobe tudo. Se há divergência, mescla via upsert.
    await upsertCollection(desc, tenantId, local);
  }

  // 3. Assina Realtime
  COLLECTIONS.forEach((c) => subscribeRealtime(c, tenantId));
}

export function stopSync() {
  if (!started) return;
  started = false;
  currentTenantId = null;
  uninstallSetItemInterceptor();
  channels.forEach((ch) => {
    void supabase.removeChannel(ch);
  });
  channels.length = 0;
  lastSnapshot.clear();
}

export function getCurrentTenantId() {
  return currentTenantId;
}
