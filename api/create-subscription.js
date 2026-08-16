import Razorpay from "razorpay";

const PLAN_ENV_MAP = {
  starter: "plan_TOYuMSz2PPGnSD",
  pro: "plan_TOZ131hn01FkIO",
  unlimited: "plan_TOZ295XTbDhEdK",
};

const RAZORPAY_KEY_ID = "rzp_live_TQYgN8izTmIcBE";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { planKey, userId, userEmail } = req.body || {};
  const razorpayPlanId = PLAN_ENV_MAP[planKey];
  if (!razorpayPlanId) return res.status(400).json({ error: "Unknown plan" });
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: 12,
      notes: { user_id: userId, plan_key: planKey, email: userEmail || "" },
    });

    res.status(200).json({
      subscriptionId: subscription.id,
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create subscription" });
  }
}
