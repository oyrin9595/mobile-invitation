import { createClient } from "jsr:@supabase/supabase-js@2";

type CreateGuestbookPayload = {
  name?: string;
  message?: string;
  password?: string;
};

const encoder = new TextEncoder();
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomUUID().replace(/-/g, "");
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(`${salt}:${password}`));
  return `${salt}:${toHex(hashBuffer)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const payload = (await req.json()) as CreateGuestbookPayload;
  const name = (payload.name ?? "").trim();
  const message = (payload.message ?? "").trim();
  const password = (payload.password ?? "").trim();

  if (!name || !message || !password) {
    return new Response(JSON.stringify({ error: "name, message, password are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (name.length > 30 || message.length > 500 || password.length < 4 || password.length > 20) {
    return new Response(JSON.stringify({ error: "Invalid input length" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const passwordHash = await hashPassword(password);
  const { data, error } = await supabase
    .from("guestbook_entries")
    .insert({ name, message, password_hash: passwordHash })
    .select("id, name, message, created_at")
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: "Failed to insert guestbook entry" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ entry: data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
