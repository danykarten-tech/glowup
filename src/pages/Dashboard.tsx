import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Flame, TrendingUp, Calendar, Gift, Copy, Check, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "@/hooks/use-toast";
import GlowJourneySection from "@/components/GlowJourneySection";
import EngagementCards from "@/components/EngagementCards";
import BeforeAfterComparison from "@/components/BeforeAfterComparison";
import DashboardHero from "@/components/dashboard/DashboardHero";
import QuickActionCards from "@/components/dashboard/QuickActionCards";
import DailyGlowTip from "@/components/dashboard/DailyGlowTip";
import ViralChallengeCard from "@/components/dashboard/ViralChallengeCard";
import PremiumTeaser from "@/components/dashboard/PremiumTeaser";

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null; plan: string; referral_code: string | null; bonus_credits: number } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const { isPaid, plan } = usePlan();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [profileRes, historyRes, referralRes] = await Promise.all([
        supabase.from("profiles").select("full_name, plan, referral_code, bonus_credits").eq("id", user.id).single(),
        supabase.from("analysis_history").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_id", user.id),
      ]);
      if (profileRes.data) setProfile(profileRes.data as any);
      if (historyRes.data) setHistory(historyRes.data);
      setReferralCount(referralRes.count || 0);
    };
    fetchData();
  }, [user]);

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const bestScore = history.length > 0 ? Math.max(...history.map((h) => h.overall_score)) : null;
  const latestScore = history.length > 0 ? history[0].overall_score : null;

  const streak = (() => {
    if (history.length === 0) return 0;
    let count = 1;
    for (let i = 1; i < history.length; i++) {
      const diff = (new Date(history[i - 1].created_at).getTime() - new Date(history[i].created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 1.5) count++;
      else break;
    }
    return count;
  })();

  const improvement = history.length >= 2 ? history[0].overall_score - history[1].overall_score : 0;

  const scansThisWeek = history.filter(h => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return new Date(h.created_at) >= startOfWeek;
  }).length;

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-5">
      {/* 1. HERO SECTION */}
      <DashboardHero
        firstName={firstName}
        improvement={improvement}
        hasHistory={history.length > 0}
      />

      {/* 2. QUICK ACTION CARDS */}
      <QuickActionCards
        hasHistory={history.length > 0}
        latestAnalysisId={history[0]?.id}
      />

      {/* 3. STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Latest Score", value: latestScore != null ? String(latestScore) : "—", icon: Sparkles },
          { label: "Day Streak", value: `${streak}`, icon: Flame },
          { label: "Best Score", value: bestScore != null ? String(bestScore) : "—", icon: TrendingUp },
          { label: "Total Scans", value: String(history.length), icon: Calendar },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
            <Card className="rounded-2xl glass-card border-0">
              <CardContent className="p-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg gradient-bg-subtle flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    <p className="font-display font-bold text-base">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 4. DAILY GLOW TIP */}
      <DailyGlowTip />

      {/* 5. GLOW PROGRESS TRACKER / JOURNEY */}
      {history.length >= 2 && (
        <GlowJourneySection history={history} streak={streak} isPaid={isPaid} />
      )}

      {/* 6. BEFORE VS AFTER */}
      {history.length >= 2 && (
        <BeforeAfterComparison
          previousPhotoUrl={history[1].photo_url}
          currentPhotoUrl={history[0].photo_url}
          previousScore={history[1].overall_score}
          currentScore={history[0].overall_score}
          previousSkinScore={history[1].skin_score}
          currentSkinScore={history[0].skin_score}
        />
      )}

      {/* 7. GLOW CHALLENGE — 7 Day + Progress */}
      <EngagementCards
        scansThisWeek={scansThisWeek}
        isPaid={isPaid}
        totalScans={history.length}
      />

      {/* 8. VIRAL CHALLENGE CARD */}
      {latestScore != null && (
        <ViralChallengeCard latestScore={latestScore} />
      )}

      {/* 9. REFERRAL CARD */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card className="rounded-3xl glass-card border-0 overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 gradient-bg opacity-[0.04]" />
            <CardHeader className="relative pb-2">
              <CardTitle className="font-display text-sm flex items-center gap-2">
                <Gift className="w-4 h-4 text-primary" />
                Invite Friends, Get Free Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <p className="text-xs text-muted-foreground">
                Share your link — when a friend signs up, you get <span className="font-semibold text-primary">5 free credits</span>!
              </p>

              {profile?.referral_code ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground truncate">
                    {`${window.location.origin}/signup?ref=${profile.referral_code}`}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1 rounded-xl text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${profile.referral_code}`);
                      setCopied(true);
                      toast({ title: "Copied!", description: "Referral link copied." });
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Loading referral code...</p>
              )}

              <div className="flex items-center gap-6 pt-1">
                <div>
                  <p className="text-xl font-display font-bold gradient-text">{referralCount}</p>
                  <p className="text-[10px] text-muted-foreground">Friends Invited</p>
                </div>
                <div>
                  <p className="text-xl font-display font-bold gradient-text">{profile?.bonus_credits || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Bonus Credits</p>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      {/* 10. PREMIUM TEASER — free users only */}
      {!isPaid && history.length > 2 && <PremiumTeaser />}

      {/* 11. RECENT ANALYSES */}
      <Card className="rounded-3xl glass-card border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-display text-sm">Recent Analyses</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link to="/history">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No analyses yet. Upload your first selfie!</p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 3).map((h) => (
                <Link
                  key={h.id}
                  to="/results"
                  state={{ analysisId: h.id }}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg gradient-bg-subtle flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Glow Analysis</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-display font-bold text-primary">{h.overall_score}</span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trust note */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center px-4 py-3">
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
          Progress comparisons are based on visible skin surface changes between scans.
        </p>
      </motion.div>
    </div>
  );
};

export default Dashboard;
