import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
  // Caso especial para os seeds hardcoded no useAuth que devem continuar funcionando
  const APELIDOS_LEGACY: Record<string, string> = {
    administrador: "administrador@gmail.com",
    matriz: "matriz@stella.com.br",
  };
  
  const lower = username.toLowerCase();
  if (APELIDOS_LEGACY[lower]) return APELIDOS_LEGACY[lower];

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

export async function redefinirSenhaAuth(email: string, novaSenha: string) {
  const user = await buscarUserPorEmail(email);
  if (!user) return { ok: false, erro: "Usuário não encontrado no Supabase Auth." };

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: novaSenha
  });

  if (error) return { ok: false, erro: error.message };
  return { ok: true };
}

export async function atualizarAuthEMetadata(userId: string, data: any) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    email: data.email,
    user_metadata: {
      nome: data.nome,
      usuario: data.usuario,
      papel: data.papel,
      status: data.status
    }
  });

  if (error) return { ok: false, erro: error.message };
  return { ok: true };
}
