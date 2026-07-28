export type Prioridade = "baixa" | "media" | "alta";
export type TipoTarefa = "tarefa" | "checklist";

export interface ItemChecklist {
  id: string;
  texto: string;
  concluido: boolean;
}

export interface Tarefa {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  prioridade: Prioridade;
  tipo: TipoTarefa;
  itens: ItemChecklist[];
  concluida: boolean;
  concluida_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface TarefaInput {
  titulo: string;
  descricao?: string;
  prioridade: Prioridade;
  tipo: TipoTarefa;
  itens?: ItemChecklist[];
}

export const LABEL_PRIORIDADE: Record<Prioridade, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};
