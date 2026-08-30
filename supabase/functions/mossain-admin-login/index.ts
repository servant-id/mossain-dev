// supabase/functions/mossain-admin-login/index.ts
//
// Custom username/password admin login for Mossa Orthopedic Care.
// Deliberately NOT Supabase Auth — the client asked to keep the same
// single-admin username/password model as the old PHP site.
//
// Flow:
//   1. Client POSTs { username, password } to this function.
//   2. We look up mossain.users with the SERVICE ROLE key (RLS-bypassing,
//      never exposed to the browser).
//   3. bcrypt.compare() runs here, server-side only.
//   4. On success we mint an opaque session token in mossain.admin_sessions
//      (24h expiry) and return it. The SPA stores it and sends it back as
//      `Authorization: Bearer <token>` on every admin write, which the
//      mossain-admin-write function checks before touching any table.

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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
    const { username, password } = await req.json();

    if (!username || !password) {
      return json({ error: "Username dan password wajib diisi." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { db: { schema: "mossain" } }
    );

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, password_hash")
      .eq("username", username)
      .maybeSingle();

    if (error) throw error;

    // Constant-shape response: don't reveal whether the username exists.
    if (!user) {
      return json({ error: "Username atau password salah." }, 401);
    }

    const ok = await compare(password, user.password_hash);
    if (!ok) {
      return json({ error: "Username atau password salah." }, 401);
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data: session, error: sessErr } = await supabase
      .from("admin_sessions")
      .insert({ user_id: user.id, expires_at: expiresAt })
      .select("token, expires_at")
      .single();

    if (sessErr) throw sessErr;

    return json({
      token: session.token,
      expires_at: session.expires_at,
      username: user.username,
    });
  } catch (e) {
    console.error(e);
    return json({ error: "Terjadi kesalahan server. Coba lagi nanti." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
