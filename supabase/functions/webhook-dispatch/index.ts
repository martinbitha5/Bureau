// Edge Function `webhook-dispatch`
// Dispatche les webhook_events en attente vers les URLs des marchands.
// Signature HMAC-SHA256 dans l'en-tête X-Sensei-Signature.
// Appelée périodiquement (cron Supabase) ou manuellement.
// Retry jusqu'à 5 tentatives ; après : status = 'failed'.

import { adminClient, corsHeaders, json } from "../_shared/merchant.ts";

async function hmacSign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return (
    "sha256=" +
    Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const admin = adminClient();

  const { data: events } = await admin
    .from("webhook_events")
    .select("id, merchant_id, event_type, payload_json, attempts")
    .eq("status", "pending")
    .lt("attempts", 5)
    .order("created_at", { ascending: true })
    .limit(50);

  if (!events || events.length === 0) return json({ dispatched: 0, failed: 0, total: 0 });

  let dispatched = 0;
  let failed = 0;

  for (const event of events) {
    const { data: merchant } = await admin
      .from("merchants")
      .select("webhook_url, webhook_secret_hash")
      .eq("id", event.merchant_id)
      .single();

    const now = new Date().toISOString();

    if (!merchant?.webhook_url) {
      await admin
        .from("webhook_events")
        .update({ status: "failed", attempts: event.attempts + 1, last_attempt_at: now })
        .eq("id", event.id);
      failed++;
      continue;
    }

    const payload = JSON.stringify({
      event: event.event_type,
      data: event.payload_json,
      timestamp: now,
    });

    const signature = merchant.webhook_secret_hash
      ? await hmacSign(merchant.webhook_secret_hash, payload)
      : "";

    let ok = false;
    try {
      const res = await fetch(merchant.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sensei-Signature": signature,
          "X-Sensei-Event": event.event_type,
        },
        body: payload,
        signal: AbortSignal.timeout(10_000),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }

    const newAttempts = event.attempts + 1;
    if (ok) {
      await admin
        .from("webhook_events")
        .update({ status: "delivered", attempts: newAttempts, last_attempt_at: now, delivered_at: now })
        .eq("id", event.id);
      dispatched++;
    } else {
      await admin
        .from("webhook_events")
        .update({
          attempts: newAttempts,
          last_attempt_at: now,
          status: newAttempts >= 5 ? "failed" : "pending",
        })
        .eq("id", event.id);
      failed++;
    }
  }

  return json({ dispatched, failed, total: events.length });
});
