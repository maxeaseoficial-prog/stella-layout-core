import { create, StateCreator } from 'zustand';
import { ChatConversa, ChatMensagem } from '../types';

interface ChatStore {
  conversas: ChatConversa[];
  conversaAtivaId: string | null;
  mensagens: Record<string, ChatMensagem[]>;
  naoLidasTotais: number;
  
  setConversas: (conversas: ChatConversa[]) => void;
  setConversaAtiva: (id: string | null) => void;
  addMensagem: (mensagem: ChatMensagem) => void;
  setMensagens: (conversaId: string, mensagens: ChatMensagem[]) => void;
  setNaoLidasTotais: (total: number) => void;
  
  // New actions
  sendMessage: (conversaId: string, texto: string) => Promise<void>;
  createGroup: (nome: string, participantes: string[]) => Promise<void>;
}

const storeApi: StateCreator<ChatStore> = (set, get) => ({
  conversas: [],
  conversaAtivaId: null,
  mensagens: {},
  naoLidasTotais: 0,

  setConversas: (conversas) => set({ conversas }),
  setConversaAtiva: (id) => set({ conversaAtivaId: id }),
  addMensagem: (msg) => set((state) => {
    const msgs = state.mensagens[msg.conversaId] || [];
    return {
      mensagens: {
        ...state.mensagens,
        [msg.conversaId]: [...msgs, msg],
      }
    };
  }),
  setMensagens: (conversaId, mensagens) => set((state) => ({
    mensagens: {
      ...state.mensagens,
      [conversaId]: mensagens,
    }
  })),
  setNaoLidasTotais: (total) => set({ naoLidasTotais: total }),
  
  sendMessage: async (conversaId, texto) => {
      // Implement logic in a later step
  },
  createGroup: async (nome, participantes) => {
      // Implement logic in a later step
  }
});

export const useChatStore = create<ChatStore>(storeApi);
