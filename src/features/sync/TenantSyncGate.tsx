import { useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { startSync, stopSync } from "./tenantSync";

/**
 * Ativa a sincronização multi-tenant enquanto o usuário estiver autenticado.
 * Exibe `fallback` até o primeiro fetch remoto terminar (evita "piscar"
 * dados antigos do localStorage e depois um novo estado remoto).
 */
export function TenantSyncGate({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setReady(true);
        return;
      }
      // Busca a empresa do usuário (RLS filtra: só volta a própria)
      const { data: link } = await supabase
        .from("empresa_usuarios")
        .select("empresa_id")
        .eq("user_id", data.user.id)
        .maybeSingle();
      const tenant =
        link?.empresa_id ?? "11111111-1111-1111-1111-111111111111";
      await startSync(tenant);
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
      stopSync();
    };
  }, []);

  if (!ready) return <>{fallback}</>;
  return <>{children}</>;
}
