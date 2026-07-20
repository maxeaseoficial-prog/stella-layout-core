import { useCallback, useEffect, useMemo, useState } from "react";

import type { Cliente, ClienteInput } from "./types";
import { getClienteNome, getClienteResponsavel } from "./types";
import { carregarClientes, salvarClientes } from "./storage";
import { novoId } from "./utils";

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    setClientes(carregarClientes());
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (hidratado) salvarClientes(clientes);
  }, [clientes, hidratado]);

  const criar = useCallback((entrada: ClienteInput): Cliente => {
    const agora = new Date().toISOString();
    const novo = {
      ...entrada,
      id: novoId(),
      status: entrada.status ?? "ativo",
      arquivos: entrada.arquivos ?? [],
      criadoEm: agora,
      atualizadoEm: agora,
    } as Cliente;
    setClientes((atual) => [novo, ...atual]);
    return novo;
  }, []);

  const atualizar = useCallback((id: string, entrada: ClienteInput) => {
    setClientes((atual) =>
      atual.map((c) =>
        c.id === id
          ? ({
              ...entrada,
              id: c.id,
              status: entrada.status ?? c.status,
              arquivos: entrada.arquivos ?? c.arquivos,
              criadoEm: c.criadoEm,
              atualizadoEm: new Date().toISOString(),
            } as Cliente)
          : c,
      ),
    );
  }, []);

  const excluir = useCallback((id: string) => {
    setClientes((atual) => atual.filter((c) => c.id !== id));
  }, []);

  const buscarPorId = useCallback(
    (id: string) => clientes.find((c) => c.id === id),
    [clientes],
  );

  const filtrar = useCallback(
    (termo: string) => {
      const t = termo.trim().toLowerCase();
      if (!t) return clientes;
      return clientes.filter((c) => {
        const nome = getClienteNome(c).toLowerCase();
        const resp = (getClienteResponsavel(c) ?? "").toLowerCase();
        const tel = c.telefone.replace(/\D/g, "");
        const empresa = c.tipo === "empresa" ? c.nomeEmpresa.toLowerCase() : "";
        return (
          nome.includes(t) ||
          resp.includes(t) ||
          empresa.includes(t) ||
          tel.includes(t.replace(/\D/g, ""))
        );
      });
    },
    [clientes],
  );

  return useMemo(
    () => ({ clientes, hidratado, criar, atualizar, excluir, buscarPorId, filtrar }),
    [clientes, hidratado, criar, atualizar, excluir, buscarPorId, filtrar],
  );
}
