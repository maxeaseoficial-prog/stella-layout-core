import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Reseta a senha de um usuário no Supabase Auth e garante que ele esteja vinculado à empresa.
 * Útil para recuperação de contas semente ou quando a sincronização falha.
 */
export const resetarSenhaSupabase = createServerFn({ method: "POST" })
  .inputValidator((d) => 
    z.object({ 
      email: z.string().email(),
      novaSenha: z.string().min(6)
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const TENANT = "11111111-1111-1111-1111-111111111111";

    // 1. Localizar usuário
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const user = list?.users.find((u) => u.email === data.email);

    if (!user) {
      return { ok: false, erro: "Usuário não encontrado no Supabase Auth." };
    }

    // 2. Atualizar senha
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: data.novaSenha }
    );

    if (updateError) {
      return { ok: false, erro: `Erro ao atualizar senha: ${updateError.message}` };
    }

    // 3. Garantir vínculo com tenant (Multi-tenancy)
    const { data: link } = await supabaseAdmin
      .from("empresa_usuarios")
      .select("id")
      .eq("empresa_id", TENANT)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!link) {
      await supabaseAdmin.from("empresa_usuarios").insert({
        empresa_id: TENANT,
        user_id: user.id,
        papel: (user.user_metadata?.papel as any) || 'operador_matriz',
      });
    }

    return { ok: true, mensagem: `Senha do usuário ${data.email} resetada com sucesso.` };
  });
