// supabase/functions/mossain-admin-verify/index.ts
//
// Checks whether a session token (issued by mossain-admin-login) is still
// valid. Called on admin page load / refresh so the SPA knows whether to
// show the dashboard or bounce to the login screen.

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    if (!token) return json({ valid: false }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { db: { schema: "mossain" } }
    );

    const { data, error } = await supabase
      .from("admin_sessions")
      .select("token, expires_at, users(username)")
      .eq("token", token)
      .maybeSingle();

    if (error) throw error;

    if (!data || new Date(data.expires_at) < new Date()) {
      return json({ valid: false });
    }

    return json({ valid: true, username: (data as any).users?.username });
  } catch (e) {
    console.error(e);
    return json({ valid: false }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
