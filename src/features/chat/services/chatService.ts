import { supabase } from "@/integrations/supabase/client";
import { ChatConversa, ChatMensagem } from "../types";

export const chatService = {
  async listarConversas(userId: string) {
    const { data, error } = await (supabase as any)
      .from("chat_conversas")
      .select(`
        *,
        participantes:chat_participantes(*)
      `)
      .contains("participantes", [{ user_id: userId }]);
    
    if (error) throw error;
    return data as any as ChatConversa[];
  },

  async enviarMensagem(conversaId: string, remetenteId: string, texto: string) {
    const { data, error } = await (supabase as any)
      .from("chat_mensagens")
      .insert({
        conversa_id: conversaId,
        remetente_id: remetenteId,
        texto,
        tipo: "texto",
        status: "enviada"
      })
      .select()
      .single();

    if (error) throw error;
    return data as any as ChatMensagem;
  },

  async criarConversaPrivada(user1Id: string, user2Id: string) {
    console.log("Criar conversa privada entre", user1Id, user2Id);
    return null;
  }
};
