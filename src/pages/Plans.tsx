import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { usePlan } from "@/hooks/usePlan";
import type { PlanType } from "@/hooks/usePlan";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    key: "free" as PlanType,
    name: "Free",
    price: "₹0",
    period: "forever",
    desc: "Try your first glow analysis",
    icon: Star,
    features: [
      "2 daily scans",
      "20 monthly scans",
      "Glow score",
      "Face symmetry",
      "Skin quality",
      "Basic tips",
    ],
    cta: "Current Plan",
    badge: null,
    gradient: false,
  },
  {
    key: "pro" as PlanType,
    name: "Glow Plus",
    price: "₹99",
    period: "/month",
    desc: "Track your skin daily and watch your glow improve with personalized AI insights.",
    icon: Crown,
    features: [
      "5 daily scans",
      "100 monthly scans",
      "Weekly glow progress",
      "Hairstyle & style AI",
      "Product recommendations",
      "Shareable result cards",
      "HD report downloads",
    ],
    cta: "Subscribe",
    badge: "Most Popular",
    gradient: true,
  },
  {
    key: "ultimate" as PlanType,
    name: "Glow Pro",
    price: "₹199",
    period: "/month",
    desc: "Unlimited scans with advanced AI insights for serious skin transformation.",
    icon: Sparkles,
    features: [
      "Unlimited daily scans",
      "Unlimited history",
      "Advanced AI insights",
      "Priority processing",
      "Product recommendations",
      "Priority support",
      "Early feature access",
    ],
    cta: "Subscribe",
    badge: "Best Value",
    gradient: false,
  },
];

const Plans = () => {
  const { plan: currentPlan, remainingDailyAnalyses, remainingMonthlyAnalyses, dailyLimit, monthlyLimit, loading } = usePlan();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planKey: PlanType) => {
    if (planKey === "free") return;
    setProcessingPlan(planKey);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({ title: "Error", description: "Failed to load payment gateway. Please try again.", variant: "destructive" });
        return;
      }

      // Create subscription via edge function
      const { data, error } = await supabase.functions.invoke("create-subscription", {
        body: { plan: planKey },
      });

      if (error || !data?.subscription_id) {
        throw new Error(error?.message || "Failed to create subscription");
      }

      const options = {
        key: data.razorpay_key,
        subscription_id: data.subscription_id,
        name: "FaceNova",
        description: data.name + " Subscription",
        handler: async (response: any) => {
          // Verify payment on backend
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-payment", {
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
                plan: planKey,
              },
            });

            if (verifyError || !verifyData?.success) {
              throw new Error("Verification failed");
            }

            // Redirect to success page
            const urlPlan = planKey === "pro" ? "plus" : "pro";
            window.location.href = `/payment-success?plan=${urlPlan}&verified=true`;
          } catch {
            window.location.href = "/payment-failed";
          }
        },
        modal: {
          ondismiss: () => setProcessingPlan(null),
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        window.location.href = "/payment-failed";
      });
      rzp.open();
    } catch (err: any) {
      console.error("Upgrade error:", err);
      toast({ title: "Error", description: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Unlock Your Glow <br />
          <span className="gradient-text">Transformation <Sparkles className="inline w-6 h-6 text-primary" /></span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Track your skin daily and watch your glow improve with personalized AI insights.
        </p>
        {!loading && (
          <p className="text-xs text-muted-foreground">
            Currently on <span className="font-semibold text-foreground capitalize">{currentPlan}</span>
            {currentPlan !== "ultimate" && (
              <> — {remainingDailyAnalyses}/{dailyLimit} today · {remainingMonthlyAnalyses}/{monthlyLimit} this month</>
            )}
          </p>
        )}
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p, i) => {
          const isCurrent = p.key === currentPlan;
          const isDowngrade =
            (currentPlan === "ultimate" && p.key !== "ultimate") ||
            (currentPlan === "pro" && p.key === "free");
          const isProcessing = processingPlan === p.key;

          return (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="relative"
            >
              {p.badge && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                    p.badge === "Most Popular" 
                      ? "gradient-bg text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {p.badge}
                  </span>
                </div>
              )}

              <div
                className={`rounded-3xl p-[1.5px] h-full ${
                  isCurrent ? "gradient-bg glow-shadow" : p.gradient ? "gradient-bg" : "bg-border"
                }`}
              >
                <div className="bg-card rounded-3xl p-5 h-full flex flex-col">
                  {isCurrent && (
                    <span className="self-start text-[10px] font-semibold px-2.5 py-0.5 rounded-full gradient-bg text-primary-foreground mb-3">
                      Your Plan
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-1">
                    <p.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-lg font-bold">{p.name}</h3>
                  </div>

                  <div className="flex items-baseline gap-1 mt-1 mb-1">
                    <span className="text-3xl font-display font-extrabold">{p.price}</span>
                    <span className="text-muted-foreground text-xs">{p.period}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{p.desc}</p>

                  <ul className="space-y-2 flex-1 mb-5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full rounded-2xl ${
                      !isCurrent && !isDowngrade ? "gradient-bg border-0 text-primary-foreground" : ""
                    }`}
                    variant={isCurrent ? "outline" : isDowngrade ? "ghost" : "default"}
                    disabled={isCurrent || isDowngrade || isProcessing}
                    onClick={() => handleUpgrade(p.key)}
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</>
                    ) : isCurrent ? (
                      "Current Plan"
                    ) : isDowngrade ? (
                      "—"
                    ) : (
                      p.cta
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-[10px] text-muted-foreground"
      >
        Cancel anytime · Secure payment via Razorpay · No hidden fees
      </motion.p>
    </div>
  );
};

export default Plans;
