import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await readRawBody(req);
  const signature = req.headers["x-razorpay-signature"];
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (signature !== expected) return res.status(400).json({ error: "Invalid signature" });

  const event = JSON.parse(rawBody);
  const eventType = event.event;

  if (eventType === "subscription.activated" || eventType === "subscription.charged") {
    const notes = event.payload?.subscription?.entity?.notes || {};
    const userId = notes.user_id;
    const planKey = notes.plan_key;

    if (userId && planKey) {
      const supabaseAdmin = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      await supabaseAdmin
        .from("profiles")
        .update({ plan: planKey, downloads_used: 0 })
        .eq("id", userId);
    }
  }

  res.status(200).json({ received: true });
}
