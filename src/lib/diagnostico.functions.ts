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

    return {
      localId: data.localId,
      authEncontrado: !!authUser,
      authUserId: authUser?.id,
      vinculoEncontrado: !!vinculo,
      idsCoincidem: authUser?.id === data.localId,
      usernameCoincide: authUser?.user_metadata?.usuario === data.usuario,
      authStatus: authUser?.user_metadata?.status
    };
  });
