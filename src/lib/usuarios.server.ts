import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


const STELLA_TENANT_ID = "11111111-1111-1111-1111-111111111111";

export async function verificarDuplicidade(username: string, email: string) {
  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  const users = list?.users || [];

  if (users.some(u => u.email?.toLowerCase() === email.toLowerCase())) {
    return { existe: true, erro: "E-mail já cadastrado no sistema de autenticação." };
  }

  if (users.some(u => u.user_metadata?.usuario?.toLowerCase() === username.toLowerCase())) {
    return { existe: true, erro: "Nome de usuário já está em uso." };
  }

  return { existe: false };
}

export async function buscarUserPorEmail(email: string) {
  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  return list?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
}

export async function criarUsuarioNoAuth({ email, password, metadata }: any) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata
    });

    if (error) return { ok: false, erro: error.message };
    return { ok: true, userId: data.user.id };
  } catch (err: any) {
    return { ok: false, erro: err.message };
  }
}

export async function vincularUsuarioEmpresa({ userId, papel, permissoes }: any) {
  try {
    const { data: existing } = await supabaseAdmin
      .from("empresa_usuarios")
      .select("id")
      .eq("empresa_id", STELLA_TENANT_ID)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabaseAdmin
        .from("empresa_usuarios")
        .update({ papel, permissoes })
        .eq("id", existing.id);
      if (error) return { ok: false, erro: error.message };
    } else {
      const { error } = await supabaseAdmin
        .from("empresa_usuarios")
        .insert({
          empresa_id: STELLA_TENANT_ID,
          user_id: userId,
          papel,
          permissoes
        });
      if (error) return { ok: false, erro: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, erro: err.message };
  }
}

export async function buscarEmailPorUsername(username: string) {
  const lower = username.toLowerCase();

  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  const user = list?.users.find(u => u.user_metadata?.usuario?.toLowerCase() === lower);
  
  if (!user || !user.email) return null;

  // Verificar se o usuário está vinculado à Stella
  const { data: vinculo } = await supabaseAdmin
    .from("empresa_usuarios")
    .select("id")
    .eq("empresa_id", STELLA_TENANT_ID)
    .eq("user_id", user.id)
    .maybeSingle();

  return vinculo ? user.email : null;
}

export async function resolverAuthUser(id: string, email?: string, username?: string) {
  // 1. Se já é um UUID, usar diretamente
  if (UUID_REGEX.test(id)) return id;

  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  const users = list?.users || [];

  // 2. Tentar por email
  if (email) {
    const byEmail = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (byEmail) return byEmail.id;
  }

  // 3. Tentar por username nos metadados
  if (username) {
    const byUser = users.find(u => u.user_metadata?.usuario?.toLowerCase() === username.toLowerCase());
    if (byUser) return byUser.id;
  }

  // 4. Tentar por email original se o ID for legacy (seed_matriz -> matriz@stella.com.br)
  if (id === "seed_matriz") {
    const matriz = users.find(u => u.email?.toLowerCase() === "matriz@stella.com.br");
    if (matriz) return matriz.id;
  }
  
  if (id === "seed_admin") {
    const admin = users.find(u => u.email?.toLowerCase() === "administrador@gmail.com");
    if (admin) return admin.id;
  }

  return null;
}

export async function atualizarAuthEMetadata(userId: string, data: any) {
  // Resolver para o UUID real se necessário
  const realId = await resolverAuthUser(userId, data.emailOriginal || data.email, data.usuarioOriginal || data.usuario);
  
  if (!realId) {
    return { ok: false, erro: `Não foi possível localizar o usuário no Auth para o ID: ${userId}` };
  }

  const updates: any = {
    email: data.email,
    user_metadata: {
      nome: data.nome,
      usuario: data.usuario,
      papel: data.papel,
      status: data.status
    }
  };

  if (data.novaSenha) {
    updates.password = data.novaSenha;
  }

  try {
    const { data: updated, error } = await supabaseAdmin.auth.admin.updateUserById(realId, updates);
    if (error) return { ok: false, erro: error.message };
    return { ok: true, userId: updated.user.id };
  } catch (err: any) {
    console.error("Erro em atualizarAuthEMetadata:", err);
    return { ok: false, erro: "Erro interno ao atualizar usuário: " + err.message };
  }
}


export async function redefinirSenhaAuth(email: string, novaSenha: string) {
  const user = await buscarUserPorEmail(email);
  if (!user) return { ok: false, erro: "Usuário não encontrado no Supabase Auth." };

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: novaSenha
  });

  if (error) return { ok: false, erro: error.message };
  return { ok: true };
}

