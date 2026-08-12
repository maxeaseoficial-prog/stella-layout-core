import type { StatusProducao } from "@/features/pedidos/types";

export type Papel = "administrador" | "operador_matriz" | "caixa";

export type ModuloRota =
  | "/"
  | "/caixa"
  | "/clientes"
  | "/pedidos"
  | "/produtos"
  | "/estoque"
  | "/fornecedores"
  | "/matrizes-logos"
  | "/tarefas"
  | "/precificacao"
  | "/fiscal"
  | "/configuracoes";


/**
 * Rotas permitidas por perfil. Se o usuário tentar acessar uma URL
 * fora desta lista, o AuthGate redireciona para o dashboard.
 */
export const ROTAS_PERMITIDAS: Record<Papel, ModuloRota[]> = {
  administrador: [
    "/",
    "/caixa",
    "/clientes",
    "/pedidos",
    "/produtos",
    "/estoque",
    "/fornecedores",
    "/matrizes-logos",
    "/precificacao",
    "/fiscal",
    "/configuracoes",
  ],

  operador_matriz: [
    "/",
    "/pedidos",
    "/clientes",
    "/matrizes-logos",
    "/tarefas",
    "/configuracoes",
  ],
  caixa: [
    "/",
    "/caixa",
    "/clientes",
    "/pedidos",
    "/produtos",
    "/configuracoes",
  ],
};

export function podeAcessarRota(papel: Papel, pathname: string, permissoesUsuario?: ModuloRota[]): boolean {
  const permitidas = permissoesUsuario ?? ROTAS_PERMITIDAS[papel];
  // Configurações é sempre permitida
  if (pathname === "/configuracoes" || pathname.startsWith("/configuracoes/")) return true;

  return permitidas.some((r) =>
    r === "/" ? pathname === "/" : pathname === r || pathname.startsWith(`${r}/`),
  );
}

/** Capacidades gerais controladas na UI. */
export interface Capacidades {
  pedidos: {
    criar: boolean;
    editar: boolean;
    excluir: boolean;
    cancelar: boolean;
    registrarPagamento: boolean;
    imprimir: boolean;
    alterarQualquerStatus: boolean;
    /** Emissão de NF-e (Spedy): apenas Administrador. */
    emitir_nfe: boolean;
  };
  clientes: {
    criar: boolean;
    editar: boolean;
    excluir: boolean;
  };
  matrizesLogos: {
    upload: boolean;
    editar: boolean;
    excluir: boolean;
  };
  configuracoes: {
    /** Se true, vê todas as abas administrativas. Caso contrário, apenas perfil pessoal. */
    admin: boolean;
  };
}

export function capacidadesDe(papel: Papel | null): Capacidades {
  if (!papel) {
    return {
      pedidos: {
        criar: false,
        editar: false,
        excluir: false,
        cancelar: false,
        registrarPagamento: false,
        imprimir: false,
        alterarQualquerStatus: false,
        emitir_nfe: false,
      },
      clientes: { criar: false, editar: false, excluir: false },
      matrizesLogos: { upload: false, editar: false, excluir: false },
      configuracoes: { admin: false },
    };
  }


  if (papel === "administrador") {
    return {
      pedidos: {
        criar: true,
        editar: true,
        excluir: true,
        cancelar: true,
        registrarPagamento: true,
        imprimir: true,
        alterarQualquerStatus: true,
        emitir_nfe: true,
      },
      clientes: { criar: true, editar: true, excluir: true },
      matrizesLogos: { upload: true, editar: true, excluir: true },
      configuracoes: { admin: true },
    };
  }
  if (papel === "caixa") {
    return {
      pedidos: {
        criar: true,
        editar: true,
        excluir: false,
        cancelar: false,
        registrarPagamento: true,
        imprimir: true,
        alterarQualquerStatus: false,
        emitir_nfe: false,
      },
      clientes: { criar: true, editar: true, excluir: false },
      matrizesLogos: { upload: false, editar: false, excluir: false },
      configuracoes: { admin: false },
    };
  }
  // Operador Matriz
  return {
    pedidos: {
      criar: false,
      editar: false,
      excluir: false,
      cancelar: false,
      registrarPagamento: false,
      imprimir: true,
      alterarQualquerStatus: false,
      emitir_nfe: false,
    },
    clientes: { criar: false, editar: false, excluir: false },
    matrizesLogos: { upload: true, editar: true, excluir: true },
    configuracoes: { admin: false },
  };
}

/**
 * Status de produção que o Operador Matriz pode aplicar.
 */
export const STATUS_PERMITIDOS_MATRIZ: StatusProducao[] = [
  "aguardando_orcamento_matriz",
  "orcamento_matriz_realizado",
  "aguardando_aprovacao",
  "producao_matriz",
  "matriz_concluida",
];

export function podeAlterarStatus(
  papel: Papel,
  status: StatusProducao,
): boolean {
  if (papel === "administrador") return true;
  return STATUS_PERMITIDOS_MATRIZ.includes(status);
}
