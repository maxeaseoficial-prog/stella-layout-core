import { createServerFn } from "@tanstack/react-start";

export const diagnosticarUsuarios = createServerFn({ method: "GET" }).handler(
  async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    const { data: dbUsers, error: dbError } = await supabaseAdmin.from("empresa_usuarios").select("*");
    
    return {
      authUsers: authUsers?.users.map(u => ({ 
        id: u.id, 
        email: u.email, 
        meta: u.user_metadata 
      })),
      dbUsers,
      errors: { authError, dbError }
    };
  }
);
