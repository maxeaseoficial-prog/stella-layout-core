import { createServerFn } from "@tanstack/react-start";

/**
 * Garante que as duas contas semente da Stella existem no Supabase Auth
 * e estão vinculadas à empresa. Idempotente: se já existirem, não altera
 * nada (não sobrescreve senha).
 *
 * Chamada silenciosamente pela tela de login na primeira montagem.
 */
export const bootstrapUsuariosStella = createServerFn({ method: "POST" }).handler(
  async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const TENANT = "11111111-1111-1111-1111-111111111111";

    const seeds = [
      {
        email: "administrador@gmail.com",
        password: "adm123",
        papel: "administrador" as const,
        nome: "Administrador",
        usuario: "administrador",
      },
      {
        email: "matriz@stella.com.br",
        password: "matriz123",
        papel: "operador_matriz" as const,
        nome: "Operador Matriz",
        usuario: "matriz",
      },
    ];

    for (const seed of seeds) {
      // Verifica se já existe
      const { data: list } =
        await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
      let user = list?.users.find((u) => u.email === seed.email);

      if (!user) {
        const { data: created, error } =
          await supabaseAdmin.auth.admin.createUser({
            email: seed.email,
            password: seed.password,
            email_confirm: true,
            user_metadata: {
              nome: seed.nome,
              usuario: seed.usuario,
              papel: seed.papel,
            },
          });
        if (error) throw error;
        user = created.user!;
      }

      // Garante vínculo com a empresa
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
          papel: seed.papel,
        });
      }
    }

    return { ok: true };
  },
);
