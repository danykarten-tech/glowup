import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Crown, Zap, Sparkles, AlertTriangle, CalendarDays, RefreshCw, ShieldCheck, Receipt } from "lucide-react";
import { PlanInfo } from "@/hooks/usePlan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PLAN_DISPLAY: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  free: { label: "Free", icon: <Sparkles className="w-4 h-4" />, color: "bg-muted text-muted-foreground" },
  pro: { label: "Glow Plus", icon: <Zap className="w-4 h-4" />, color: "bg-primary/20 text-primary" },
  ultimate: { label: "Glow Pro", icon: <Crown className="w-4 h-4" />, color: "bg-amber-500/20 text-amber-600 dark:text-amber-400" },
};

interface Props {
  planInfo: PlanInfo;
}

const SubscriptionManagement = ({ planInfo }: Props) => {
  const {
    plan, isFree, isPaid,
    analysisCountToday, analysisCountThisMonth,
    dailyLimit, monthlyLimit,
    renewalDate, autoRenewEnabled, cancelAtPeriodEnd,
    subscriptionStatus,
  } = planInfo;

  const { user } = useAuth();
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);

  const display = PLAN_DISPLAY[plan] || PLAN_DISPLAY.free;
  const dailyPercent = dailyLimit === Infinity ? 0 : (analysisCountToday / dailyLimit) * 100;
  const monthlyPercent = monthlyLimit === Infinity ? 0 : (analysisCountThisMonth / monthlyLimit) * 100;

  const renewalDateFormatted = renewalDate
    ? new Date(renewalDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const handleCancelSubscription = async () => {
    if (!user) return;
    setCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription");
      if (error) throw error;

      toast({
        title: "Subscription cancelled",
        description: `Your premium features remain active until ${renewalDateFormatted || "the end of your billing period"}.`,
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      toast({ title: "Error", description: "Failed to cancel subscription. Please try again.", variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  };

  const handleDowngradeNow = async () => {
    if (!user) return;
    setCancelling(true);
    try {
      // Cancel on Razorpay first
      await supabase.functions.invoke("cancel-subscription");
      
      // Force immediate downgrade
      await supabase.from("profiles").update({
        plan: "free",
        auto_renew_enabled: false,
        cancel_at_period_end: false,
        subscription_status: "expired",
        renewal_date: null,
        razorpay_subscription_id: null,
      } as any).eq("id", user.id);

      toast({ title: "Downgraded to Free", description: "You're now on the Free plan." });
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      toast({ title: "Error", description: "Failed to downgrade. Please try again.", variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <Card className="rounded-3xl border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Manage Subscription
            </CardTitle>
            <Badge className={`${display.color} border-0 gap-1.5 px-3 py-1`}>
              {display.icon}
              {display.label}
            </Badge>
          </div>
          <CardDescription>
            {isFree
              ? "You're on the free plan. Upgrade for more scans and premium features."
              : `You're subscribed to ${display.label}. Enjoy your premium glow journey!`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Usage Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily Scans</span>
                <span className="font-semibold">
                  {analysisCountToday} / {dailyLimit === Infinity ? "∞" : dailyLimit}
                </span>
              </div>
              {dailyLimit !== Infinity ? (
                <Progress value={dailyPercent} className="h-2" />
              ) : (
                <p className="text-xs text-primary font-medium">Unlimited scans ✨</p>
              )}
            </div>
            <div className="rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Monthly Scans</span>
                <span className="font-semibold">
                  {analysisCountThisMonth} / {monthlyLimit === Infinity ? "∞" : monthlyLimit}
                </span>
              </div>
              {monthlyLimit !== Infinity ? (
                <Progress value={monthlyPercent} className="h-2" />
              ) : (
                <p className="text-xs text-primary font-medium">Unlimited scans ✨</p>
              )}
            </div>
          </div>

          {/* Subscription Details */}
          {isPaid && (
            <div className="space-y-3">
              {renewalDateFormatted && (
                <div className="rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50 p-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {cancelAtPeriodEnd ? "Premium expires" : "Next renewal"}
                  </span>
                  <span className="text-sm font-semibold">{renewalDateFormatted}</span>
                </div>
              )}

              <div className="rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50 p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Auto-renew
                </span>
                <Badge className={autoRenewEnabled
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-0"
                  : "bg-muted text-muted-foreground border-0"
                }>
                  {autoRenewEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              <div className="rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50 p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Status
                </span>
                <Badge className={
                  subscriptionStatus === "active"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-0"
                    : subscriptionStatus === "cancelled"
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-0"
                    : "bg-muted text-muted-foreground border-0"
                }>
                  {subscriptionStatus === "active" ? "Active" : subscriptionStatus === "cancelled" ? "Cancelling" : "Expired"}
                </Badge>
              </div>
            </div>
          )}

          {cancelAtPeriodEnd && isPaid && (
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-1">
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Subscription Cancelling
              </p>
              <p className="text-xs text-muted-foreground">
                Your premium features remain active until <span className="font-semibold text-foreground">{renewalDateFormatted}</span>. After that, you'll be moved to the Free plan.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-1">
            {isFree ? (
              <Button
                className="gradient-bg border-0 text-primary-foreground w-full gap-2"
                onClick={() => navigate("/plans")}
              >
                <Zap className="w-4 h-4" />
                Upgrade My Glow
              </Button>
            ) : (
              <>
                {plan === "pro" && (
                  <Button
                    className="gradient-bg border-0 text-primary-foreground w-full gap-2"
                    onClick={() => navigate("/plans")}
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Glow Pro
                  </Button>
                )}

                {!cancelAtPeriodEnd && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="w-full text-destructive hover:text-destructive text-sm">
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          Cancel your subscription?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Your premium features will remain active until {renewalDateFormatted || "the end of your billing period"}. After that, you'll be moved to the Free plan automatically.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction
                          className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={handleCancelSubscription}
                          disabled={cancelling}
                        >
                          {cancelling ? "Processing..." : "Cancel Subscription"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full text-muted-foreground text-sm">
                      Downgrade to Free Now
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Downgrade immediately?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will immediately remove your premium access and cancel your Razorpay subscription. You'll lose extended scan limits, full history, and advanced insights right now.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Keep Premium</AlertDialogCancel>
                      <AlertDialogAction
                        className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDowngradeNow}
                        disabled={cancelling}
                      >
                        {cancelling ? "Processing..." : "Downgrade Now"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

            {/* Payment History Link */}
            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground gap-2"
              onClick={() => navigate("/payment-history")}
            >
              <Receipt className="w-4 h-4" />
              View Payment History
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubscriptionManagement;
