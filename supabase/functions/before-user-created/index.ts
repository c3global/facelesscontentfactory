// Supabase Auth Hook: before-user-created
// Blocks signup unless the email exists in public.members with status='active'.
// Configure in Supabase Dashboard → Authentication → Hooks → Before User Created.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const payload = await req.json();
  const email = (payload?.user?.email || "").trim().toLowerCase();

  if (!email) {
    return new Response(JSON.stringify({ decision: "reject", message: "Missing email" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await admin
    .from("members")
    .select("status")
    .eq("email", email)
    .maybeSingle();

  if (error || !data || data.status !== "active") {
    return new Response(
      JSON.stringify({
        decision: "reject",
        message: "This email isn't on our active member list — join the Faceless Content Collective to get in.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ decision: "continue" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
