import { createServerFn } from "@tanstack/react-start";

export const diagnosticarUsuarios = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const { data: dbUsers } = await supabaseAdmin.from("empresa_usuarios").select("*");
    
    return {
      authUsers: authUsers?.users.map(u => ({ 
        id: u.id, 
        email: u.email, 
        meta: {
          nome: u.user_metadata?.nome,
          usuario: u.user_metadata?.usuario,
          papel: u.user_metadata?.papel
        }
      })) || [],
      dbUsers: dbUsers?.map(u => ({
        user_id: u.user_id,
        papel: u.papel
      })) || []
    };
  }
);
