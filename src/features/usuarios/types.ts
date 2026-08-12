import type { ModuloRota, Papel } from "@/features/auth/permissions";

export type StatusUsuario = "ativo" | "inativo";

export interface HistoricoUsuario {
  id: string;
  data: string; // ISO
  acao:
    | "criado"
    | "editado"
    | "senha_redefinida"
    | "ativado"
    | "desativado"
    | "excluido"
    | "senha_alterada"
    | "login";
  responsavel: string;
  detalhe?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  usuario: string; // username (lowercase, único)
  email: string;
  telefone?: string;
  foto?: string; // data URL
  papel: Papel;
  // Credenciais não são persistidas localmente
  status: StatusUsuario;
  precisaTrocarSenha: boolean;
  criadoEm: string;
  atualizadoEm: string;
  ultimoAcesso?: string;
  historico: HistoricoUsuario[];
  /** true para contas semente (não podem ser excluídas) */
  padrao?: boolean;
  /** abas de navegação permitidas para este usuário específico */
  permissoesAbas?: ModuloRota[];
}

export type NovoUsuarioInput = Omit<
  Usuario,
  "id" | "criadoEm" | "atualizadoEm" | "historico" | "ultimoAcesso"
> & { senha: string };

export type AtualizarUsuarioInput = Partial<Omit<Usuario, "id" | "criadoEm" | "historico">> & {
  novaSenha?: string;
};


export const PAPEL_LABEL: Record<Papel, string> = {
  administrador: "Administrador",
  operador_matriz: "Operador Matriz",
  caixa: "Caixa",
};
