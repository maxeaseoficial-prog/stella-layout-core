import { create, StateCreator } from 'zustand';
import { ChatConversa, ChatMensagem } from '../types';
import { chatService } from '../services/chatService';
import { supabase } from '@/integrations/supabase/client';
import { tocarSomToast } from '@/lib/toast-som';

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
  
  // Actions
  init: (userId: string) => void;
  sendMessage: (conversaId: string, remetenteId: string, texto: string) => Promise<void>;
  createGroup: (tenantId: string, nome: string, criadorId: string, participantes: string[]) => Promise<string>;
  startPrivateChat: (tenantId: string, user1Id: string, user2Id: string) => Promise<string>;
}

const storeApi: StateCreator<ChatStore> = (set, get) => ({
  conversas: [],
  conversaAtivaId: null,
  mensagens: {},
  naoLidasTotais: 0,

  setConversas: (conversas) => set({ conversas }),
  setConversaAtiva: (id) => {
    set({ conversaAtivaId: id });
    if (id) {
        // Reset unread for this conversation could be added here if we had per-conversa unread counts
    }
  },
  addMensagem: (msg) => set((state) => {
    const currentMsgs = state.mensagens[msg.conversaId] || [];
    // Avoid duplicates from realtime
    if (currentMsgs.some(m => m.id === msg.id)) return state;
    
    return {
      mensagens: {
        ...state.mensagens,
        [msg.conversaId]: [...currentMsgs, msg],
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

  init: async (userId) => {
      // 1. Load initial state
      const convs = await chatService.listarConversas(userId);
      set({ conversas: convs });

      // 2. Setup Realtime for messages
      supabase
        .channel('public:chat_mensagens')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_mensagens' }, async (payload) => {
            const newMsgRaw = payload.new;
            
            // Re-fetch conversations if it's a new one or just find existing
            const state = get();
            let conversation = state.conversas.find((c: ChatConversa) => c.id === newMsgRaw.conversa_id);
            
            if (!conversation) {
                // Check if user is participant (maybe newly added to a group)
                const freshConvs = await chatService.listarConversas(userId);
                set({ conversas: freshConvs });
                conversation = freshConvs.find((c: ChatConversa) => c.id === newMsgRaw.conversa_id);
            }
            
            if (conversation) {
                const msg: ChatMensagem = {
                    id: newMsgRaw.id,
                    conversaId: newMsgRaw.conversa_id,
                    remetenteId: newMsgRaw.remetente_id,
                    texto: newMsgRaw.texto,
                    criadoEm: newMsgRaw.criado_em,
                    lida: newMsgRaw.status === 'lida',
                    tipo: newMsgRaw.tipo,
                    status: newMsgRaw.status,
                    metadata: newMsgRaw.metadata
                };
                
                state.addMensagem(msg);
                
                // Update conversation's last message and move to top
                const updatedConvs = get().conversas.map((c: ChatConversa) => 
                    c.id === msg.conversaId ? { ...c, ultimaMensagem: msg, atualizadoEm: msg.criadoEm } : c
                ).sort((a: ChatConversa, b: ChatConversa) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime());

                
                set({ conversas: updatedConvs });

                // If not active and not from self, increment unread and play sound
                if (state.conversaAtivaId !== msg.conversaId && msg.remetenteId !== userId) {
                    set({ naoLidasTotais: get().naoLidasTotais + 1 });
                    tocarSomToast();
                }
            }
        })
        .subscribe();

      // Realtime for new participants (new groups or private chats)
      supabase
        .channel('public:chat_participantes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_participantes' }, async (payload) => {
            if (payload.new.user_id === userId) {
                const freshConvs = await chatService.listarConversas(userId);
                set({ conversas: freshConvs });
            }
        })
        .subscribe();
  },

  sendMessage: async (conversaId, remetenteId, texto) => {
      const msg = await chatService.enviarMensagem(conversaId, remetenteId, texto);
      get().addMensagem(msg);
      // Update last message in list locally too for immediate feedback
      const state = get();
      const updatedConvs = state.conversas.map((c: ChatConversa) => 
          c.id === msg.conversaId ? { ...c, ultimaMensagem: msg, atualizadoEm: msg.criadoEm } : c
      ).sort((a: ChatConversa, b: ChatConversa) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime());

      set({ conversas: updatedConvs });
  },

  createGroup: async (tenantId, nome, criadorId, participantes) => {
      const id = await chatService.criarGrupo(tenantId, nome, criadorId, participantes);
      const freshConvs = await chatService.listarConversas(criadorId);
      set({ conversas: freshConvs });
      return id;
  },

  startPrivateChat: async (tenantId, user1Id, user2Id) => {
      const id = await chatService.criarConversaPrivada(tenantId, user1Id, user2Id);
      const freshConvs = await chatService.listarConversas(user1Id);
      set({ conversas: freshConvs });
      return id;
  }
});

export const useChatStore = create<ChatStore>(storeApi);

