import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { TENANT_ID } from "@/features/auth/useAuth";

import { fiscalConfigInicial, mergeFiscalConfig } from "./defaults";
import type { FiscalConfig } from "./types";

/**
 * Carrega/salva as configurações fiscais direto na tabela
 * `configuracoes_fiscais` (RLS: somente administradores do tenant).
 * Não passa pelo localStorage/sync para não expor a API key a outros perfis.
 */
export function useFiscalConfig() {
  const [config, setConfig] = useState<FiscalConfig>(fiscalConfigInicial());
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    void (async () => {
      const { data, error } = await supabase
        .from("configuracoes_fiscais")
        .select("data")
        .eq("tenant_id", TENANT_ID)
        .maybeSingle();
      if (!ativo) return;
      if (error) {
        setErro("Não foi possível carregar as configurações fiscais.");
      } else if (data?.data) {
        setConfig(mergeFiscalConfig(data.data));
      }
      setCarregando(false);
    })();
    return () => {
      ativo = false;
    };
  }, []);

  const salvar = useCallback(async (nova: FiscalConfig): Promise<boolean> => {
    setSalvando(true);
    setErro(null);
    const { error } = await supabase
      .from("configuracoes_fiscais")
      .upsert(
        {
          id: TENANT_ID,
          tenant_id: TENANT_ID,
          data: JSON.parse(JSON.stringify(nova)),
        },
        { onConflict: "id" },
      );
    setSalvando(false);
    if (error) {
      setErro("Falha ao salvar as configurações fiscais.");
      return false;
    }
    setConfig(nova);
    return true;
  }, []);

  return { config, carregando, salvando, erro, salvar };
}
