import { useCallback, useMemo, useSyncExternalStore } from "react";

import { novoId } from "@/features/clientes/utils";
import { carregar, salvar } from "./storage";
import { configuracoesIniciais } from "./defaults";
import type {
  Aparencia,
  Categoria,
  ConfigNumeracao,
  ConfiguracoesState,
  DadosEmpresa,
  EscopoCategoria,
  FormaPagamento,
  Preferencias,
  TipoNumeracao,
  Usuario,
} from "./types";

const EVENT = "stella:configuracoes:updated";

let cache: ConfiguracoesState | null = null;
const listeners = new Set<() => void>();

function isBrowser() {
  return typeof window !== "undefined";
}

function getSnapshot(): ConfiguracoesState {
  if (cache === null) cache = carregar();
  return cache;
}

function setState(next: ConfiguracoesState) {
  cache = next;
  salvar(next);
  listeners.forEach((l) => l());
  if (isBrowser()) window.dispatchEvent(new CustomEvent(EVENT));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onEvt = () => {
    cache = carregar();
    listener();
  };
  if (isBrowser()) window.addEventListener(EVENT, onEvt);
  return () => {
    listeners.delete(listener);
    if (isBrowser()) window.removeEventListener(EVENT, onEvt);
  };
}

const EMPTY = configuracoesIniciais();
function getServerSnapshot(): ConfiguracoesState {
  return EMPTY;
}

function normalizar(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function formatarNumeracao(cfg: ConfigNumeracao, n?: number): string {
  const numero = n ?? cfg.proximo;
  const padded = String(numero).padStart(cfg.digitos, "0");
  return `${cfg.prefixo}${padded}`;
}

export function useConfiguracoes() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hidratado = isBrowser();

  // ---------- Empresa ----------
  const salvarEmpresa = useCallback((empresa: DadosEmpresa) => {
    setState({ ...getSnapshot(), empresa });
  }, []);

  // ---------- Preferências ----------
  const salvarPreferencias = useCallback((preferencias: Preferencias) => {
    setState({ ...getSnapshot(), preferencias });
  }, []);

  // ---------- Numeração ----------
  const salvarNumeracao = useCallback(
    (tipo: TipoNumeracao, cfg: ConfigNumeracao) => {
      const atual = getSnapshot();
      setState({
        ...atual,
        numeracao: { ...atual.numeracao, [tipo]: cfg },
      });
    },
    [],
  );

  /** Consome o próximo número e incrementa. Retorna o número formatado. */
  const consumirNumeracao = useCallback((tipo: TipoNumeracao): string => {
    const atual = getSnapshot();
    const cfg = atual.numeracao[tipo];
    const usado = formatarNumeracao(cfg);
    setState({
      ...atual,
      numeracao: { ...atual.numeracao, [tipo]: { ...cfg, proximo: cfg.proximo + 1 } },
    });
    return usado;
  }, []);

  // ---------- Categorias ----------
  const criarCategoria = useCallback(
    (escopo: EscopoCategoria, nome: string): Categoria | null => {
      const nomeNorm = normalizar(nome);
      if (!nomeNorm) return null;
      const atual = getSnapshot();
      const existe = atual.categorias.some(
        (c) => c.escopo === escopo && normalizar(c.nome) === nomeNorm,
      );
      if (existe) return null;
      const nova: Categoria = {
        id: novoId(),
        escopo,
        nome: nome.trim(),
        criadoEm: new Date().toISOString(),
      };
      setState({ ...atual, categorias: [...atual.categorias, nova] });
      return nova;
    },
    [],
  );

  const editarCategoria = useCallback((id: string, nome: string): boolean => {
    const atual = getSnapshot();
    const alvo = atual.categorias.find((c) => c.id === id);
    if (!alvo) return false;
    const nomeNorm = normalizar(nome);
    if (!nomeNorm) return false;
    const duplicado = atual.categorias.some(
      (c) => c.id !== id && c.escopo === alvo.escopo && normalizar(c.nome) === nomeNorm,
    );
    if (duplicado) return false;
    setState({
      ...atual,
      categorias: atual.categorias.map((c) => (c.id === id ? { ...c, nome: nome.trim() } : c)),
    });
    return true;
  }, []);

  const excluirCategoria = useCallback((id: string) => {
    const atual = getSnapshot();
    setState({ ...atual, categorias: atual.categorias.filter((c) => c.id !== id) });
  }, []);

  const categoriasPorEscopo = useCallback(
    (escopo: EscopoCategoria) => state.categorias.filter((c) => c.escopo === escopo),
    [state.categorias],
  );

  // ---------- Formas de Pagamento ----------
  const criarFormaPagamento = useCallback((nome: string): FormaPagamento | null => {
    const nomeNorm = normalizar(nome);
    if (!nomeNorm) return null;
    const atual = getSnapshot();
    if (atual.formasPagamento.some((f) => normalizar(f.nome) === nomeNorm)) return null;
    const nova: FormaPagamento = {
      id: novoId(),
      nome: nome.trim(),
      ativo: true,
      criadoEm: new Date().toISOString(),
    };
    setState({ ...atual, formasPagamento: [...atual.formasPagamento, nova] });
    return nova;
  }, []);

  const editarFormaPagamento = useCallback(
    (id: string, patch: Partial<Pick<FormaPagamento, "nome" | "ativo">>): boolean => {
      const atual = getSnapshot();
      const alvo = atual.formasPagamento.find((f) => f.id === id);
      if (!alvo) return false;
      if (patch.nome !== undefined) {
        const nomeNorm = normalizar(patch.nome);
        if (!nomeNorm) return false;
        if (
          atual.formasPagamento.some(
            (f) => f.id !== id && normalizar(f.nome) === nomeNorm,
          )
        ) {
          return false;
        }
      }
      setState({
        ...atual,
        formasPagamento: atual.formasPagamento.map((f) =>
          f.id === id ? { ...f, ...patch, nome: patch.nome?.trim() ?? f.nome } : f,
        ),
      });
      return true;
    },
    [],
  );

  const excluirFormaPagamento = useCallback((id: string) => {
    const atual = getSnapshot();
    setState({
      ...atual,
      formasPagamento: atual.formasPagamento.filter((f) => f.id !== id),
    });
  }, []);

  // ---------- Usuários ----------
  const salvarUsuarios = useCallback((usuarios: Usuario[]) => {
    setState({ ...getSnapshot(), usuarios });
  }, []);

  // ---------- Aparência ----------
  const salvarAparencia = useCallback((aparencia: Aparencia) => {
    setState({ ...getSnapshot(), aparencia });
  }, []);

  // ---------- Backup ----------
  const exportar = useCallback((): string => JSON.stringify(getSnapshot(), null, 2), []);
  const importar = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as Partial<ConfiguracoesState>;
      const base = configuracoesIniciais();
      setState({ ...base, ...parsed } as ConfiguracoesState);
      return true;
    } catch {
      return false;
    }
  }, []);

  const restaurarPadrao = useCallback(() => {
    setState(configuracoesIniciais());
  }, []);

  return useMemo(
    () => ({
      state,
      hidratado,
      salvarEmpresa,
      salvarPreferencias,
      salvarNumeracao,
      consumirNumeracao,
      criarCategoria,
      editarCategoria,
      excluirCategoria,
      categoriasPorEscopo,
      criarFormaPagamento,
      editarFormaPagamento,
      excluirFormaPagamento,
      salvarUsuarios,
      salvarAparencia,
      exportar,
      importar,
      restaurarPadrao,
    }),
    [
      state,
      hidratado,
      salvarEmpresa,
      salvarPreferencias,
      salvarNumeracao,
      consumirNumeracao,
      criarCategoria,
      editarCategoria,
      excluirCategoria,
      categoriasPorEscopo,
      criarFormaPagamento,
      editarFormaPagamento,
      excluirFormaPagamento,
      salvarUsuarios,
      salvarAparencia,
      exportar,
      importar,
      restaurarPadrao,
    ],
  );
}
