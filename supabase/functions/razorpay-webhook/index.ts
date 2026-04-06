import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const bodyText = await req.text();
    const razorpaySignature = req.headers.get("x-razorpay-signature");

    if (!razorpaySignature) {
      console.error("Missing x-razorpay-signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature
    const expectedSignature = await hmacSha256(razorpaySecret, bodyText);
    if (expectedSignature !== razorpaySignature) {
      console.error("Webhook signature mismatch");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;
    const entity = payload.payload?.subscription?.entity || payload.payload?.payment?.entity;

    console.log("Razorpay webhook event:", event);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    switch (event) {
      // Recurring payment captured successfully
      case "subscription.charged": {
        const subscriptionId = payload.payload.subscription.entity.id;
        const payment = payload.payload.payment.entity;
        const notes = payload.payload.subscription.entity.notes || {};
        const userId = notes.user_id;
        const plan = notes.plan;

        if (!userId) {
          console.error("No user_id in subscription notes");
          break;
        }

        // Record the payment
        await adminClient.from("payments").insert({
          user_id: userId,
          razorpay_payment_id: payment.id,
          razorpay_subscription_id: subscriptionId,
          plan: plan || "pro",
          amount: payment.amount,
          currency: payment.currency || "INR",
          status: "captured",
        });

        // Extend renewal date by 30 days
        await adminClient
          .from("profiles")
          .update({
            renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_status: "active",
            auto_renew_enabled: true,
            cancel_at_period_end: false,
          })
          .eq("id", userId);

        console.log(`Renewal processed for user ${userId}, plan ${plan}`);
        break;
      }

      // Subscription activated (first payment)
      case "subscription.activated": {
        const subEntity = payload.payload.subscription.entity;
        const notes = subEntity.notes || {};
        const userId = notes.user_id;
        const plan = notes.plan;

        if (userId && plan) {
          await adminClient.rpc("activate_premium_plan", {
            p_user_id: userId,
            p_plan: plan,
          });

          await adminClient
            .from("profiles")
            .update({ razorpay_subscription_id: subEntity.id })
            .eq("id", userId);

          console.log(`Subscription activated for user ${userId}, plan ${plan}`);
        }
        break;
      }

      // Payment failed on renewal
      case "subscription.pending": {
        const subEntity = payload.payload.subscription.entity;
        const notes = subEntity.notes || {};
        const userId = notes.user_id;

        if (userId) {
          await adminClient
            .from("profiles")
            .update({ subscription_status: "pending" })
            .eq("id", userId);

          console.log(`Subscription pending (payment retry) for user ${userId}`);
        }
        break;
      }

      // Subscription halted after all retries failed
      case "subscription.halted": {
        const subEntity = payload.payload.subscription.entity;
        const notes = subEntity.notes || {};
        const userId = notes.user_id;

        if (userId) {
          await adminClient.rpc("check_subscription_expiry", { p_user_id: userId });

          await adminClient
            .from("profiles")
            .update({
              subscription_status: "halted",
              auto_renew_enabled: false,
            })
            .eq("id", userId);

          console.log(`Subscription halted for user ${userId}`);
        }
        break;
      }

      // User or system cancelled
      case "subscription.cancelled": {
        const subEntity = payload.payload.subscription.entity;
        const notes = subEntity.notes || {};
        const userId = notes.user_id;

        if (userId) {
          await adminClient
            .from("profiles")
            .update({
              cancel_at_period_end: true,
              auto_renew_enabled: false,
              subscription_status: "cancelled",
            })
            .eq("id", userId);

          console.log(`Subscription cancelled for user ${userId}`);
        }
        break;
      }

      // Subscription completed its total billing cycles
      case "subscription.completed": {
        const subEntity = payload.payload.subscription.entity;
        const notes = subEntity.notes || {};
        const userId = notes.user_id;

        if (userId) {
          await adminClient.rpc("check_subscription_expiry", { p_user_id: userId });
          console.log(`Subscription completed for user ${userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
