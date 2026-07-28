import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth/useAuth";
import type { Tarefa, TarefaInput, ItemChecklist } from "./types";

function gerarId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function fromRow(row: any): Tarefa {
  return {
    id: row.id,
    user_id: row.user_id,
    titulo: row.titulo,
    descricao: row.descricao,
    prioridade: row.prioridade,
    tipo: row.tipo,
    itens: Array.isArray(row.itens) ? (row.itens as ItemChecklist[]) : [],
    concluida: !!row.concluida,
    concluida_em: row.concluida_em,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function useTarefas() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    if (!userId) {
      setTarefas([]);
      setHidratado(true);
      return;
    }
    let cancelled = false;
    setHidratado(false);
    (async () => {
      const { data } = await supabase
        .from("tarefas" as any)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setTarefas(((data ?? []) as any[]).map(fromRow));
      setHidratado(true);
    })();

    const channel = supabase
      .channel(`tarefas:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tarefas", filter: `user_id=eq.${userId}` },
        (payload) => {
          setTarefas((prev) => {
            if (payload.eventType === "INSERT") {
              const nova = fromRow(payload.new);
              if (prev.some((t) => t.id === nova.id)) return prev;
              return [nova, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const atualizada = fromRow(payload.new);
              return prev.map((t) => (t.id === atualizada.id ? atualizada : t));
            }
            if (payload.eventType === "DELETE") {
              const antiga = payload.old as { id: string };
              return prev.filter((t) => t.id !== antiga.id);
            }
            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const criar = useCallback(
    async (input: TarefaInput) => {
      if (!userId) return;
      const payload = {
        user_id: userId,
        titulo: input.titulo.trim(),
        descricao: input.descricao?.trim() || null,
        prioridade: input.prioridade,
        tipo: input.tipo,
        itens: input.tipo === "checklist" ? (input.itens ?? []) : [],
        concluida: false,
        concluida_em: null,
      };
      const { data, error } = await supabase
        .from("tarefas" as any)
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      const nova = fromRow(data);
      setTarefas((prev) => (prev.some((t) => t.id === nova.id) ? prev : [nova, ...prev]));
    },
    [userId],
  );

  const atualizar = useCallback(
    async (id: string, patch: Partial<Tarefa>) => {
      const updates: any = { ...patch };
      delete updates.id;
      delete updates.user_id;
      delete updates.created_at;
      delete updates.updated_at;
      const { data, error } = await supabase
        .from("tarefas" as any)
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      const atualizada = fromRow(data);
      setTarefas((prev) => prev.map((t) => (t.id === atualizada.id ? atualizada : t)));
    },
    [],
  );

  const excluir = useCallback(async (id: string) => {
    const { error } = await supabase.from("tarefas" as any).delete().eq("id", id);
    if (error) throw error;
    setTarefas((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const marcarConcluida = useCallback(
    async (id: string, concluida: boolean) => {
      const tarefa = tarefas.find((t) => t.id === id);
      const patch: Partial<Tarefa> = {
        concluida,
        concluida_em: concluida ? new Date().toISOString() : null,
      };
      if (tarefa?.tipo === "checklist" && concluida) {
        patch.itens = tarefa.itens.map((it) => ({ ...it, concluido: true }));
      }
      await atualizar(id, patch);
    },
    [tarefas, atualizar],
  );

  const alternarItem = useCallback(
    async (tarefaId: string, itemId: string) => {
      const tarefa = tarefas.find((t) => t.id === tarefaId);
      if (!tarefa) return;
      const itens = tarefa.itens.map((it) =>
        it.id === itemId ? { ...it, concluido: !it.concluido } : it,
      );
      const todosConcluidos = itens.length > 0 && itens.every((it) => it.concluido);
      const patch: Partial<Tarefa> = { itens };
      if (todosConcluidos && !tarefa.concluida) {
        patch.concluida = true;
        patch.concluida_em = new Date().toISOString();
      } else if (!todosConcluidos && tarefa.concluida) {
        patch.concluida = false;
        patch.concluida_em = null;
      }
      await atualizar(tarefaId, patch);
    },
    [tarefas, atualizar],
  );

  const adicionarItem = useCallback(
    async (tarefaId: string, texto: string) => {
      const tarefa = tarefas.find((t) => t.id === tarefaId);
      if (!tarefa) return;
      const novoItem: ItemChecklist = { id: gerarId(), texto: texto.trim(), concluido: false };
      const itens = [...tarefa.itens, novoItem];
      const patch: Partial<Tarefa> = { itens };
      if (tarefa.concluida) {
        patch.concluida = false;
        patch.concluida_em = null;
      }
      await atualizar(tarefaId, patch);
    },
    [tarefas, atualizar],
  );

  const removerItem = useCallback(
    async (tarefaId: string, itemId: string) => {
      const tarefa = tarefas.find((t) => t.id === tarefaId);
      if (!tarefa) return;
      const itens = tarefa.itens.filter((it) => it.id !== itemId);
      const todosConcluidos = itens.length > 0 && itens.every((it) => it.concluido);
      const patch: Partial<Tarefa> = { itens };
      if (todosConcluidos && !tarefa.concluida) {
        patch.concluida = true;
        patch.concluida_em = new Date().toISOString();
      }
      await atualizar(tarefaId, patch);
    },
    [tarefas, atualizar],
  );

  return {
    tarefas,
    hidratado,
    criar,
    atualizar,
    excluir,
    marcarConcluida,
    alternarItem,
    adicionarItem,
    removerItem,
  };
}

export { gerarId };
