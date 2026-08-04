import { supabase } from "@/integrations/supabase/client";
import { ChatConversa, ChatMensagem } from "../types";

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
    const { data, error } = await supabase
      .from("chat_conversas")
      .select(`
        *,
        participantes:chat_participantes(user_id),
        mensagens:chat_mensagens(
          id, conversa_id, remetente_id, texto, tipo, status, metadata, criado_em
        )
      `)
      .order('atualizado_em', { ascending: false });
    
    if (error) throw error;

    // Filter by participant in JS since .contains isn't always easy with nested selects on some versions
    const filtered = (data || []).filter(c => 
      c.participantes.some((p: any) => p.user_id === userId)
    );

    return filtered.map(c => {
      const conv = mapConversa(c);
      const lastMsg = (c.mensagens as any[])?.sort((a,b) => 
        new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
      )[0];
      if (lastMsg) conv.ultimaMensagem = mapMensagem(lastMsg);
      return conv;
    });
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
    
    // Update conversation timestamp
    await supabase.from("chat_conversas").update({ atualizado_em: new Date().toISOString() }).eq("id", conversaId);
    
    return mapMensagem(data);
  },

  async criarConversaPrivada(tenantId: string, user1Id: string, user2Id: string) {
    // 1. Check if exists
    const { data: existing } = await supabase
      .from("chat_conversas")
      .select(`
        id,
        participantes:chat_participantes(user_id)
      `)
      .eq("tipo", "privada");

    const match = existing?.find(c => 
      c.participantes.length === 2 &&
      c.participantes.some((p: any) => p.user_id === user1Id) &&
      c.participantes.some((p: any) => p.user_id === user2Id)
    );

    if (match) return match.id;

    // 2. Create new
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

    // 3. Add participants
    const { error: partErr } = await supabase
      .from("chat_participantes")
      .insert([
        { conversa_id: conv.id, user_id: user1Id },
        { conversa_id: conv.id, user_id: user2Id }
      ]);

    if (partErr) throw partErr;

    return conv.id;
  },

  async criarGrupo(tenantId: string, nome: string, criadorId: string, participantesIds: string[]) {
    const { data: conv, error: convErr } = await supabase
      .from("chat_conversas")
      .insert({
        tenant_id: tenantId,
        tipo: "grupo",
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
    // In a real app we'd have a join or per-user read status, 
    // for now we just mark messages not from user as read
    await supabase
      .from("chat_mensagens")
      .update({ status: "lida" })
      .eq("conversa_id", conversaId)
      .neq("remetente_id", userId);
  }
};
