import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export type PlanType = "free" | "pro" | "ultimate";
export type SubscriptionStatus = "active" | "cancelled" | "expired";

interface PlanLimits {
  daily: number;
  monthly: number;
}

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: { daily: 2, monthly: 20 },
  pro: { daily: 5, monthly: 100 },
  ultimate: { daily: Infinity, monthly: Infinity },
};

export interface PlanInfo {
  plan: PlanType;
  isFree: boolean;
  isPro: boolean;
  isUltimate: boolean;
  isPaid: boolean;
  analysisCountToday: number;
  analysisCountThisMonth: number;
  canAnalyze: boolean;
  remainingDailyAnalyses: number;
  remainingMonthlyAnalyses: number;
  dailyLimit: number;
  monthlyLimit: number;
  loading: boolean;
  /** Bonus generations from referrals (one-time, never expire) */
  bonusCredits: number;
  /** Subscription fields */
  planStartDate: string | null;
  renewalDate: string | null;
  autoRenewEnabled: boolean;
  cancelAtPeriodEnd: boolean;
  subscriptionStatus: SubscriptionStatus;
}

export function usePlan(): PlanInfo {
  const isAdmin = useIsAdmin();
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanType>("free");
  const [dailyCount, setDailyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [bonusCredits, setBonusCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [planStartDate, setPlanStartDate] = useState<string | null>(null);
  const [renewalDate, setRenewalDate] = useState<string | null>(null);
  const [autoRenewEnabled, setAutoRenewEnabled] = useState(false);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>("expired");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      // Check for subscription expiry first
      try {
        await supabase.rpc("check_subscription_expiry", { p_user_id: user.id });
      } catch {
        // Non-critical, continue
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [profileRes, monthCountRes, dayCountRes] = await Promise.all([
        supabase.from("profiles").select("plan, bonus_credits, plan_start_date, renewal_date, auto_renew_enabled, cancel_at_period_end, subscription_status").eq("id", user.id).single() as any,
        supabase
          .from("analysis_history")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfMonth.toISOString()),
        supabase
          .from("analysis_history")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfDay.toISOString()),
      ]);

      const data = profileRes.data as any;
      const rawPlan = isAdmin ? "ultimate" : data?.plan;
      const userPlan: PlanType =
        rawPlan === "ultimate" ? "ultimate" : rawPlan === "pro" ? "pro" : "free";
      setPlan(userPlan);
      setBonusCredits(isAdmin ? 0 : (data?.bonus_credits || 0));
      setDailyCount(isAdmin ? 0 : (dayCountRes.count || 0));
      setMonthlyCount(isAdmin ? 0 : (monthCountRes.count || 0));
      setPlanStartDate(data?.plan_start_date || null);
      setRenewalDate(data?.renewal_date || null);
      setAutoRenewEnabled(isAdmin ? true : (data?.auto_renew_enabled ?? false));
      setCancelAtPeriodEnd(data?.cancel_at_period_end ?? false);
      setSubscriptionStatus(isAdmin ? "active" : (data?.subscription_status || "expired"));
      setLoading(false);
    };

    fetchPlan();
  }, [user, isAdmin]);

  const isFree = plan === "free";
  const isPro = plan === "pro";
  const isUltimate = plan === "ultimate";
  const isPaid = isPro || isUltimate;
  const limits = PLAN_LIMITS[plan];

  const effectiveMonthlyLimit = limits.monthly + bonusCredits;
  const remainingDaily = Math.max(0, limits.daily - dailyCount);
  const remainingMonthly = Math.max(0, effectiveMonthlyLimit - monthlyCount);
  const canAnalyze = dailyCount < limits.daily && monthlyCount < effectiveMonthlyLimit;

  return {
    plan,
    isFree,
    isPro,
    isUltimate,
    isPaid,
    analysisCountToday: dailyCount,
    analysisCountThisMonth: monthlyCount,
    canAnalyze,
    remainingDailyAnalyses: remainingDaily,
    remainingMonthlyAnalyses: remainingMonthly,
    dailyLimit: limits.daily,
    monthlyLimit: effectiveMonthlyLimit,
    loading,
    bonusCredits,
    planStartDate,
    renewalDate,
    autoRenewEnabled,
    cancelAtPeriodEnd,
    subscriptionStatus,
  };
}
