import { createServerFn } from "@tanstack/react-start";
import { supabaseAuthMiddleware } from "./auth-middleware";

export const verifyProjectSync = createServerFn({ method: "GET" })
  .middleware([supabaseAuthMiddleware])
  .handler(async ({ context }) => {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
    
    const extractRef = (url?: string) => url?.split('//')[1]?.split('.')[0];
    const serverRef = extractRef(SUPABASE_URL);

    return {
      serverRef,
      // Do not return actual values, just the existence and ref
      isConfigured: !!SUPABASE_URL && !!SUPABASE_PUBLISHABLE_KEY,
      status: "AUTH-DEBUG-V5-01a2d8f1"
    };
  });
