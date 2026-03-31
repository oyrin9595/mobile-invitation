import { createClient } from "jsr:@supabase/supabase-js@2";

type DeleteGuestbookPayload = {
  id?: string;
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

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(`${salt}:${password}`));
  return toHex(hashBuffer) === hash;
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

  const payload = (await req.json()) as DeleteGuestbookPayload;
  const id = (payload.id ?? "").trim();
  const password = (payload.password ?? "").trim();
  if (!id || !password) {
    return new Response(JSON.stringify({ error: "id and password are required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data: row, error: selectError } = await supabase
    .from("guestbook_entries")
    .select("id, password_hash")
    .eq("id", id)
    .single();

  if (selectError || !row) {
    return new Response(JSON.stringify({ error: "Entry not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const isValidPassword = await verifyPassword(password, row.password_hash);
  if (!isValidPassword) {
    return new Response(JSON.stringify({ error: "Password mismatch" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error: deleteError } = await supabase.from("guestbook_entries").delete().eq("id", id);
  if (deleteError) {
    return new Response(JSON.stringify({ error: "Failed to delete entry" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
