import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ROTAS_PERMITIDAS } from "@/features/auth/permissions";

const STELLA_TENANT_ID = "11111111-1111-1111-1111-111111111111";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if the current authenticated user is an administrator for Stella.
 */
export async function validarAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("empresa_usuarios")
    .select("papel")
    .eq("empresa_id", STELLA_TENANT_ID)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data || data.papel !== "administrador") {
    console.error(`[Auth] User ${userId} is not an administrator or error occurred:`, error);
    return false;
  }
  return true;
}

export async function resolverAuthUser(id: string, email?: string, username?: string) {
  if (UUID_REGEX.test(id)) return id;

  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  const users = list?.users || [];

  if (email) {
    const byEmail = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (byEmail) return byEmail.id;
  }

  if (username) {
    const byUser = users.find(u => u.user_metadata?.usuario?.toLowerCase() === username.toLowerCase());
    if (byUser) return byUser.id;
  }

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

export async function vincularUsuarioEmpresa({ userId, papel, permissoes }: any) {
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
}

export async function buscarUserPorEmail(email: string) {
  const { data: list } = await supabaseAdmin.auth.admin.listUsers();
  return list?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
}
