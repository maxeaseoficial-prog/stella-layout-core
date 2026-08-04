import { supabase } from "@/integrations/supabase/client";
import { ChatConversa, ChatMensagem } from "../types";
import { AuthUser } from "@/features/auth/useAuth";

// Helper to map DB row to ChatMensagem
const mapMensagem = (m: any): ChatMensagem => ({
  id: m.id,
  conversaId: m.conversa_id,
  remetenteId: m.remetente_id,
  texto: m.texto,
  criadoEm: m.criado_em,
  lida: m.status === 'lida',
  tipo: m.tipo as any,
  status: m.status as any,
  metadata: m.metadata
});

// Helper to map DB row to ChatConversa
const mapConversa = (c: any): ChatConversa => ({
  id: c.id,
  tipo: c.tipo,
  nome: c.nome,
  foto: c.foto,
  participantes: c.participantes?.map((p: any) => p.user_id) || [],
  criadoEm: c.criado_em,
  atualizadoEm: c.atualizado_em,
  criadoPor: c.criado_por
});

export const chatService = {
  async listarConversas(userId: string) {
    // Cast to any to bypass strict type check on new tables
    const { data, error } = await supabase
      .from("chat_conversas")
      .select(`
        *,
        participantes:chat_participantes(user_id)
      `);
    
    if (error) throw error;

    const filtered = (data || []).filter((c: any) => 
      c.participantes.some((p: any) => p.user_id === userId)
    );

    return filtered.map(mapConversa);
  },

  async listarMensagens(conversaId: string) {
    const { data, error } = await supabase
      .from("chat_mensagens")
      .select("*")
      .eq("conversa_id", conversaId)
      .order("criado_em", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapMensagem);
  },

  async enviarMensagem(conversaId: string, remetenteId: string, texto: string) {
    const { data, error } = await supabase
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
    
    await supabase.from("chat_conversas").update({ atualizado_em: new Date().toISOString() }).eq("id", conversaId);
    
    return mapMensagem(data);
  },

  async criarConversaPrivada(tenantId: string, user1Id: string, user2Id: string) {
    const { data: existing } = await supabase
      .from("chat_conversas")
      .select(`
        id,
        participantes:chat_participantes(user_id)
      `)
      .eq("tipo", "privada");

    const match = existing?.find((c: any) => 
      c.participantes.length === 2 &&
      c.participantes.some((p: any) => p.user_id === user1Id) &&
      c.participantes.some((p: any) => p.user_id === user2Id)
    );

    if (match) return match.id;

    const { data: conv, error: convErr } = await supabase
      .from("chat_conversas")
      .insert({
        tenant_id: tenantId,
        tipo: "privada",
        criado_por: user1Id
      })
      .select()
      .single();

    if (convErr) throw convErr;

    const { error: partErr } = await supabase
      .from("chat_participantes")
      .insert([
        { conversa_id: conv.id, user_id: user1Id },
        { conversa_id: conv.id, user_id: user2Id }
      ]);

    if (partErr) throw partErr;

    return conv.id;
  },

  getChatName(c: ChatConversa, currentUser: AuthUser | null, usuarios: any[]) {
    if (c.tipo === 'grupo') return c.nome || "Grupo";
    const otherId = c.participantes.find((id: string) => id !== currentUser?.id);
    const otherUser = usuarios.find(u => u.id === otherId);
    return otherUser?.nome || otherUser?.usuario || "Usuário";
  },
        nome,
        criado_por: criadorId
      })
      .select()
      .single();

    if (convErr) throw convErr;

    const allParts = Array.from(new Set([criadorId, ...participantesIds]));
    const { error: partErr } = await supabase
      .from("chat_participantes")
      .insert(allParts.map(uid => ({ conversa_id: conv.id, user_id: uid })));

    if (partErr) throw partErr;

    return conv.id;
  },

  async marcarComoLida(conversaId: string, userId: string) {
    await supabase
      .from("chat_mensagens")
      .update({ status: "lida" })
      .eq("conversa_id", conversaId)
      .neq("remetente_id", userId);
  }
};
