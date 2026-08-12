import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const STELLA_TENANT_ID = "11111111-1111-1111-1111-111111111111";

export const diagnosticarUsuario = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ email: z.string().email(), localId: z.string(), usuario: z.string() }).parse(d))
  .handler(async ({ data }) => {
    // 1. Buscar no Auth
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = users.find(u => u.email?.toLowerCase() === data.email.toLowerCase());

    // 2. Buscar vínculo
    let vinculo = null;
    if (authUser) {
        const { data: v } = await supabaseAdmin
            .from("empresa_usuarios")
            .select("*")
            .eq("user_id", authUser.id)
            .eq("empresa_id", STELLA_TENANT_ID)
            .maybeSingle();
        vinculo = v;
    }

    // Regra 2: Retornar diagnóstico completo sem expor segredos
    return {
      localId: data.localId,
      localEmail: data.email,
      localUsuario: data.usuario,
      
      authEncontrado: !!authUser,
      authUserId: authUser?.id,
      authEmail: authUser?.email,
      emailConfirmado: authUser?.email_confirmed_at ? true : false,
      authUsername: authUser?.user_metadata?.usuario,
      authNome: authUser?.user_metadata?.nome,
      authPapelMetadata: authUser?.user_metadata?.papel,
      authStatusMetadata: authUser?.user_metadata?.status,

      vinculoEncontrado: !!vinculo,
      vinculoId: vinculo?.id,
      vinculoEmpresaId: vinculo?.empresa_id,
      vinculoUserId: vinculo?.user_id,
      vinculoPapel: vinculo?.papel,
      vinculoPermissoes: vinculo?.permissoes,

      idsCoincidem: authUser?.id === data.localId,
      usernameCoincide: authUser?.user_metadata?.usuario === data.usuario,
      emailCoincide: authUser?.email?.toLowerCase() === data.email.toLowerCase(),

      podeAutenticar: !!authUser && !!vinculo && authUser?.id === data.localId && authUser?.user_metadata?.status !== "inativo"
    };
  });
