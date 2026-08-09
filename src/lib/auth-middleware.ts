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

    console.log("[Supabase Auth Middleware] AUTH_STAGE_CLIENT:", {
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
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
    
    // Safety check for Project ID / URL matching
    // Extract project ref from URL: https://wjshquqnkzkbubgigxvh.supabase.co -> wjshquqnkzkbubgigxvh
    const extractRef = (url?: string) => url?.split('//')[1]?.split('.')[0];
    const serverRef = extractRef(SUPABASE_URL);

    console.log("[Supabase Auth Middleware] PROJECT_CHECK:", {
      serverRef,
      hasUrl: !!SUPABASE_URL,
      hasKey: !!SUPABASE_PUBLISHABLE_KEY
    });

    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    const authHeader = request?.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    console.log("[Supabase Auth Middleware] AUTH_STAGE_MIDDLEWARE_RECEIVE:", {
      authorizationHeaderExists: !!authHeader,
      tokenReceived: !!token,
      requestId: request?.headers.get("x-request-id") || "N/A"
    });

    if (!token) {
      console.error("[Supabase Auth Middleware] ERROR: AUTH_TOKEN_MISSING_TOKEN");
      throw new Error("AUTH_TOKEN_MISSING_TOKEN (AUTH-DEBUG-V5-01a2d8f1)");
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
    
    console.log("[Supabase Auth Middleware] AUTH_STAGE_MIDDLEWARE_VERIFY:", {
      getUserSuccess: !!user,
      authenticatedUserId: user?.id,
      error: userError?.message,
    });

    if (userError || !user) {
      console.error("[Supabase Auth Middleware] ERROR: AUTH_TOKEN_INVALID", userError?.message);
      throw new Error(`AUTH_TOKEN_INVALID: ${userError?.message || 'No user'} (AUTH-DEBUG-V5-01a2d8f1)`);
    }

    return next({
      context: {
        supabase: supabaseServer,
        userId: user.id,
      },
    });
  });
