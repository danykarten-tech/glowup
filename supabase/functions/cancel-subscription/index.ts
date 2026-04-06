import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Get user's Razorpay subscription ID
    const { data: profile } = await adminClient
      .from("profiles")
      .select("razorpay_subscription_id, plan")
      .eq("id", user.id)
      .single();

    if (!profile?.razorpay_subscription_id) {
      // No Razorpay subscription, just cancel locally
      await adminClient.from("profiles").update({
        auto_renew_enabled: false,
        cancel_at_period_end: true,
      }).eq("id", user.id);

      return new Response(JSON.stringify({ success: true, message: "Subscription marked for cancellation" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cancel Razorpay subscription at end of billing cycle
    const authString = btoa(`${razorpayKeyId}:${razorpaySecret}`);
    const cancelRes = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${profile.razorpay_subscription_id}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify({ cancel_at_cycle_end: 1 }),
      }
    );

    const cancelData = await cancelRes.json();

    if (!cancelRes.ok) {
      console.error("Razorpay cancel failed:", cancelData);
      // Still mark locally even if Razorpay fails
    }

    // Update profile
    await adminClient.from("profiles").update({
      auto_renew_enabled: false,
      cancel_at_period_end: true,
    }).eq("id", user.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
