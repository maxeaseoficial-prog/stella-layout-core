import { ModuloRota } from "@/features/auth/permissions";

export interface ChatMensagem {
  id: string;
  conversaId: string;
  remetenteId: string;
  texto: string;
  criadoEm: string;
  lida: boolean;
  tipo: "texto" | "arquivo" | "audio";
  status: "enviada" | "entregue" | "lida";
  metadata?: {
    arquivoUrl?: string;
    arquivoNome?: string;
    arquivoTipo?: string;
    audioUrl?: string;
    mencoes?: string[];
    respostaParaId?: string;
  };
}

export interface ChatConversa {
  id: string;
  tipo: "privada" | "grupo";
  nome?: string;
  foto?: string;
  participantes: string[]; // IDs dos usuários
  ultimaMensagem?: ChatMensagem;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: string;
}

export interface ChatEstado {
  conversas: ChatConversa[];
  mensagens: Record<string, ChatMensagem[]>; // conversaId -> mensagens
  onlineUsers: string[]; // IDs dos usuários online
}
