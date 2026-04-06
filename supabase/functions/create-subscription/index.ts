import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_CONFIG: Record<string, { amount: number; name: string; description: string }> = {
  pro: { amount: 9900, name: "Glow Plus", description: "Glow Plus - ₹99/month" },
  ultimate: { amount: 19900, name: "Glow Pro", description: "Glow Pro - ₹199/month" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")!;
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const plan = body?.plan;

    if (!plan || !PLAN_CONFIG[plan]) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const config = PLAN_CONFIG[plan];
    const authString = btoa(`${razorpayKeyId}:${razorpaySecret}`);

    // Step 1: Create a Razorpay Plan
    const planRes = await fetch("https://api.razorpay.com/v1/plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({
        period: "monthly",
        interval: 1,
        item: {
          name: config.name,
          amount: config.amount,
          currency: "INR",
          description: config.description,
        },
      }),
    });

    const planData = await planRes.json();
    if (!planRes.ok) {
      console.error("Razorpay plan creation failed:", planData);
      return new Response(JSON.stringify({ error: "Failed to create plan", details: planData }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Create a Subscription
    const subRes = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify({
        plan_id: planData.id,
        total_count: 12,
        quantity: 1,
        notes: {
          user_id: user.id,
          plan: plan,
          user_email: user.email,
        },
      }),
    });

    const subData = await subRes.json();
    if (!subRes.ok) {
      console.error("Razorpay subscription creation failed:", subData);
      return new Response(JSON.stringify({ error: "Failed to create subscription", details: subData }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      subscription_id: subData.id,
      razorpay_key: razorpayKeyId,
      plan: plan,
      amount: config.amount,
      name: config.name,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
