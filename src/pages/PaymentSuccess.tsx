import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [activating, setActivating] = useState(true);
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planParam = searchParams.get("plan");
  const verified = searchParams.get("verified") === "true";

  const planMap: Record<string, { internal: string; name: string }> = {
    plus: { internal: "pro", name: "Glow Plus" },
    pro: { internal: "ultimate", name: "Glow Pro" },
  };
  const mapped = planParam ? planMap[planParam] : null;
  const planName = mapped?.name || "Premium";
  const internalPlan = mapped?.internal;

  useEffect(() => {
    if (!user || !planParam) return;
    if (!mapped) {
      setError("Invalid plan");
      setActivating(false);
      return;
    }

    const activate = async () => {
      try {
        // If payment was already verified by Razorpay flow, just confirm
        if (verified) {
          setActivated(true);
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#a78bfa", "#c4b5fd", "#e9d5ff", "#f0abfc"],
          });
          setActivating(false);
          return;
        }

        // Fallback: activate via edge function (for test mode)
        const { data, error: fnError } = await supabase.functions.invoke("activate-plan", {
          body: { plan: internalPlan },
        });

        if (fnError || !data?.success) {
          throw new Error(fnError?.message || "Activation failed");
        }

        setActivated(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#a78bfa", "#c4b5fd", "#e9d5ff", "#f0abfc"],
        });
      } catch (err: any) {
        console.error("Plan activation error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setActivating(false);
      }
    };

    activate();
  }, [user, planParam]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl bg-card border border-border/50 p-8 text-center space-y-6 shadow-xl">
          {activating ? (
            <>
              <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="font-display text-2xl font-bold">Activating Your Plan...</h1>
              <p className="text-sm text-muted-foreground">Please wait while we unlock your premium features.</p>
            </>
          ) : error ? (
            <>
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="font-display text-2xl font-bold">Activation Issue</h1>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button className="gradient-bg border-0 text-primary-foreground gap-2" asChild>
                <Link to="/plans">Try Again</Link>
              </Button>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-10 h-10 text-primary-foreground" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <h1 className="font-display text-2xl font-bold">
                  Glow Premium Activated ✨
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your <span className="font-semibold text-foreground">{planName}</span> plan is now active. Your full glow journey is now unlocked.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button className="gradient-bg border-0 text-primary-foreground gap-2 w-full rounded-2xl h-12" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
