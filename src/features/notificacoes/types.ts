import type { LucideIcon } from "lucide-react";

import type { Papel } from "@/features/auth/permissions";

export type TipoNotificacao =
  | "estoque_movimentacao"
  | "estoque_baixo"
  | "estoque_alto"
  | "pedido_pago"
  | "pedido_em_producao"
  | "pedido_pendente_orcamento_matriz";

export interface Notificacao {
  /** ID determinístico (não muda entre renders para a mesma condição). */
  id: string;
  papelAlvo: Papel;
  tipo: TipoNotificacao;
  titulo: string;
  descricao: string;
  /** Rota alvo ao clicar. */
  rota: string;
  /** Query string opcional (ex.: "?highlight=..."). */
  search?: Record<string, string>;
  /** ISO timestamp usado para ordenar. */
  criadoEm: string;
  /** Ícone opcional (definido no popover). */
  icon?: LucideIcon;
}
