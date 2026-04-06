import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Flame, Calendar, ArrowUpRight, ArrowDownRight, Lock, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SignedImage from "@/components/SignedImage";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { usePlan } from "@/hooks/usePlan";

const UserHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const { isPaid } = usePlan();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("analysis_history")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setHistory(data);
      });
  }, [user]);

  const improvement = history.length >= 2
    ? history[0].overall_score - history[history.length - 1].overall_score
    : 0;

  const weeklyImprovement = history.length >= 2
    ? history[0].overall_score - history[Math.min(6, history.length - 1)].overall_score
    : 0;

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

  const chartData = [...history]
    .slice(0, 10)
    .reverse()
    .map((h) => ({
      date: new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: h.overall_score,
    }));

  const FREE_VISIBLE_COUNT = 3;
  const visibleHistory = isPaid ? history : history.slice(0, FREE_VISIBLE_COUNT);
  const lockedHistory = isPaid ? [] : history.slice(FREE_VISIBLE_COUNT);

  return (
    <div className="p-4 md:p-10 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold mb-1">Your Glow Journey</h1>
        <p className="text-sm text-muted-foreground">Track your skin improvement over time.</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border-0 glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-xl font-display font-bold gradient-text">
                {improvement >= 0 ? "+" : ""}{improvement}
              </p>
              <p className="text-[10px] text-muted-foreground">Total Change</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="rounded-2xl border-0 glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-xl font-display font-bold text-foreground">{streak}</p>
              <p className="text-[10px] text-muted-foreground">Day Streak 🔥</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border-0 glass-card">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-xl font-display font-bold text-foreground">{history.length}</p>
              <p className="text-[10px] text-muted-foreground">Total Scans</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Insight */}
      {history.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-3xl p-4 flex items-center gap-3"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${weeklyImprovement >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
            {weeklyImprovement >= 0 ? (
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-display font-semibold text-foreground">
              Your skin {weeklyImprovement >= 0 ? "improved" : "changed"} {Math.abs(weeklyImprovement)}% this week
            </p>
            <p className="text-xs text-muted-foreground">
              {weeklyImprovement > 0 ? "Keep up the great work! ✨" : weeklyImprovement === 0 ? "Steady progress — stay consistent!" : "Try adjusting your routine for better results"}
            </p>
          </div>
        </motion.div>
      )}

      {/* Progress Graph */}
      {chartData.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-3xl border-0 glass-card">
            <CardContent className="p-4">
              <h3 className="font-display text-sm font-semibold mb-3">Glow Score Progress</h3>
              <ChartContainer
                config={{ score: { label: "Glow Score", color: "hsl(var(--primary))" } }}
                className="h-[180px] w-full"
              >
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glowFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="date" className="text-[10px]" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis domain={[0, 100]} className="text-[10px]" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fill="url(#glowFill)"
                    dot={{ fill: "hsl(var(--primary))", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* History List */}
      {history.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-muted-foreground">No analyses yet. Upload your first selfie!</p>
          <Button className="gradient-bg border-0 text-primary-foreground rounded-2xl" asChild>
            <Link to="/upload">Start Your Glow Journey</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="font-display text-sm font-semibold px-1">Scan History</h3>
          {visibleHistory.map((h, i) => {
            const prevScore = i < history.length - 1 ? history[i + 1]?.overall_score : null;
            const change = prevScore !== null ? h.overall_score - prevScore : null;
            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.04 }}
              >
                <Link to="/results" state={{ analysisId: h.id }}>
                  <Card className="rounded-2xl glass-card hover:shadow-md transition-shadow">
                    <CardContent className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                          {h.photo_url ? (
                            <SignedImage storagePath={h.photo_url} alt="Selfie" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <span className="text-lg">📸</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Glow Analysis</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        {change !== null && (
                          <span className={`text-xs font-medium ${change >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                            {change >= 0 ? "+" : ""}{change}
                          </span>
                        )}
                        <p className="text-xl font-display font-bold gradient-text">{h.overall_score}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}

          {/* Locked history entries for free users */}
          {lockedHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative space-y-3"
            >
              {/* Blurred entries */}
              <div className="relative">
                <div className="space-y-3 blur-[6px] pointer-events-none select-none">
                  {lockedHistory.slice(0, 3).map((h) => (
                    <Card key={h.id} className="rounded-2xl glass-card">
                      <CardContent className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-muted" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Glow Analysis</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <p className="text-xl font-display font-bold text-muted-foreground">{h.overall_score}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>

              {/* Premium upgrade card */}
              <Card className="rounded-3xl glass-card border border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
                <CardContent className="p-5 space-y-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-semibold text-sm">Unlock Your Full Glow History</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {lockedHistory.length} more scan{lockedHistory.length !== 1 ? "s" : ""} hidden — upgrade to see your complete glow journey
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="glass-card rounded-2xl p-3 space-y-1.5">
                      <p className="font-semibold text-foreground">Glow Plus</p>
                      <ul className="space-y-1 text-muted-foreground text-left">
                        <li>• 30-day comparison</li>
                        <li>• Full progress charts</li>
                        <li>• Routine evolution</li>
                      </ul>
                    </div>
                    <div className="glass-card rounded-2xl p-3 space-y-1.5 border border-primary/20">
                      <p className="font-semibold gradient-text">Glow Pro</p>
                      <ul className="space-y-1 text-muted-foreground text-left">
                        <li>• Unlimited history</li>
                        <li>• AI improvement timeline</li>
                        <li>• Deep before/after</li>
                      </ul>
                    </div>
                  </div>
                  <Button className="w-full gradient-bg border-0 text-primary-foreground rounded-2xl gap-2" asChild>
                    <Link to="/plans">
                      <Crown className="w-4 h-4" />
                      Unlock Full Journey
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Scan CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <Button className="gradient-bg border-0 text-primary-foreground rounded-2xl gap-2" asChild>
          <Link to="/upload">Take Today's Scan →</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default UserHistory;
