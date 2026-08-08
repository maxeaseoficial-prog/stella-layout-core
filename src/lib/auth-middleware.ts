import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Helper to handle the 'apikey' header for Supabase calls in serverless environments
function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

export const supabaseAuthMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    console.log("[Supabase Auth Middleware] CLIENT:", {
      sessionExists: !!session,
      tokenExists: !!token,
    });

    return next({
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  })
  .server(async ({ next }) => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const authHeader = request?.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    console.log("[Supabase Auth Middleware] SERVER:", {
      authorizationHeaderExists: !!authHeader,
      tokenReceived: !!token,
    });

    if (!token) {
      throw new Error("AUTH_CONTEXT_MISSING_TOKEN");
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Error("SUPABASE_ENV_MISSING");
    }

    const supabaseServer = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
          headers: { Authorization: `Bearer ${token}` },
        },
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);
    
    console.log("[Supabase Auth Middleware] SERVER RESULT:", {
      getUserSuccess: !!user,
      authenticatedUserId: user?.id,
      error: userError?.message,
    });

    if (userError || !user) {
      throw new Error("AUTH_TOKEN_INVALID");
    }

    return next({
      context: {
        supabase: supabaseServer,
        userId: user.id,
      },
    });
  });
