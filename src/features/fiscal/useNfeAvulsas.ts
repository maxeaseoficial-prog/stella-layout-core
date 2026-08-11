import { useCallback, useEffect, useMemo, useState } from "react";
import { carregarNfeAvulsas, NFE_AVULSA_EVENT, notificarNfeAvulsaAtualizado, salvarNfeAvulsas } from "./avulsa-storage";
import { NfeAvulsa } from "./avulsa-types";
import { novoId } from "@/features/clientes";
import { NotaFiscalPedido } from "./types";

export function useNfeAvulsas() {
  const [notas, setNotas] = useState<NfeAvulsa[]>([]);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    function recarregar() {
      setNotas(carregarNfeAvulsas());
    }
    recarregar();
    setHidratado(true);
    window.addEventListener(NFE_AVULSA_EVENT, recarregar);
    return () => window.removeEventListener(NFE_AVULSA_EVENT, recarregar);
  }, []);

  const criar = useCallback((entrada: Omit<NfeAvulsa, "id" | "criadaEm" | "atualizadaEm">) => {
    const agora = new Date().toISOString();
    const nova: NfeAvulsa = {
      ...entrada,
      id: novoId(),
      criadaEm: agora,
      atualizadaEm: agora,
    };
    const atualizadas = [nova, ...carregarNfeAvulsas()];
    salvarNfeAvulsas(atualizadas);
    notificarNfeAvulsaAtualizado();
    return nova;
  }, []);

  const atualizarNotaFiscal = useCallback((id: string, nota: NotaFiscalPedido) => {
    const atual = carregarNfeAvulsas();
    const atualizadas = atual.map(n => n.id === id ? {
      ...n,
      notaFiscal: nota,
      atualizadaEm: new Date().toISOString()
    } : n);
    salvarNfeAvulsas(atualizadas);
    notificarNfeAvulsaAtualizado();
  }, []);

  const excluir = useCallback((id: string) => {
    const atual = carregarNfeAvulsas();
    const atualizadas = atual.filter(n => n.id !== id);
    salvarNfeAvulsas(atualizadas);
    notificarNfeAvulsaAtualizado();
  }, []);

  return {
    notas,
    hidratado,
    criar,
    atualizarNotaFiscal,
    excluir
  };
}
