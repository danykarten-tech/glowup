import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Trophy, Flame, Droplets, Sparkles, Star, Zap, Award } from "lucide-react";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface HistoryEntry {
  id: string;
  overall_score: number;
  skin_score: number | null;
  symmetry_score: number | null;
  created_at: string;
}

interface GlowJourneySectionProps {
  history: HistoryEntry[];
  streak: number;
  isPaid: boolean;
}

const BADGES = [
  { id: "firstScan", label: "First Scan", icon: Zap, threshold: (_s: number, h: HistoryEntry[]) => h.length >= 1, color: "text-violet-400" },
  { id: "streak3", label: "3 Day Streak", icon: Flame, threshold: (s: number) => s >= 3, color: "text-orange-500" },
  { id: "streak7", label: "7 Day Glow Streak", icon: Star, threshold: (s: number) => s >= 7, color: "text-amber-400" },
  { id: "hydration", label: "Hydration Master", icon: Droplets, threshold: (_: number, h: HistoryEntry[]) => h.some(e => (e.skin_score ?? 0) >= 80), color: "text-sky-400" },
  { id: "texture", label: "Texture Improved", icon: Sparkles, threshold: (_: number, h: HistoryEntry[]) => {
    if (h.length < 2) return false;
    return h[0].overall_score > h[h.length - 1].overall_score;
  }, color: "text-emerald-400" },
  { id: "glowLevelUp", label: "Glow Level Up", icon: Award, threshold: (_: number, h: HistoryEntry[]) => {
    if (h.length < 2) return false;
    return h[0].overall_score - h[h.length - 1].overall_score >= 10;
  }, color: "text-pink-400" },
];

const GlowJourneySection = ({ history, streak, isPaid }: GlowJourneySectionProps) => {
  const last7 = history.slice(0, 7).reverse();
  const bestThisWeek = last7.length > 0 ? Math.max(...last7.map(h => h.overall_score)) : 0;
  const weekImprovement = last7.length >= 2
    ? last7[last7.length - 1].overall_score - last7[0].overall_score
    : 0;

  const chartData = last7.map(h => {
    const skinDetails = (h as any).analysis_data?.skin?.details || [];
    const getVal = (kw: string) => skinDetails.find((d: any) => d.label?.toLowerCase().includes(kw))?.value;
    return {
      date: new Date(h.created_at).toLocaleDateString("en-US", { weekday: "short" }),
      score: h.overall_score,
      skin: h.skin_score ?? 0,
      texture: getVal("texture") ?? getVal("smooth") ?? (h.skin_score ?? 60),
      acne: getVal("acne") ?? getVal("clarity") ?? Math.max((h.skin_score ?? 65) - 5, 30),
    };
  });

  const earnedBadges = BADGES.filter(b => b.threshold(streak, history));

  // Confetti on new badge earned
  const prevBadgeCount = useRef(earnedBadges.length);
  useEffect(() => {
    if (earnedBadges.length > prevBadgeCount.current) {
      const colors = ["#a855f7", "#d946ef", "#f472b6", "#facc15", "#34d399"];
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors });
    }
    prevBadgeCount.current = earnedBadges.length;
  }, [earnedBadges.length]);

  // Insights
  const insights: string[] = [];
  if (weekImprovement > 0) insights.push(`Your glow score improved ${weekImprovement}% this week`);
  else if (weekImprovement === 0 && last7.length >= 2) insights.push("Your glow score stayed consistent this week");
  else if (weekImprovement < 0) insights.push("Your glow dipped slightly — consistency will help");

  if (last7.length >= 2) {
    const skinScores = last7.map(h => h.skin_score ?? 0);
    if (skinScores[skinScores.length - 1] > skinScores[0]) insights.push("Hydration trend moving upward ✨");
  }

  if (streak >= 3) insights.push(`Amazing ${streak}-day streak — keep the momentum!`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 px-1">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-bold">Your Glow Journey</h2>
      </div>

      {/* Weekly Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Best This Week", value: bestThisWeek || "—" },
          { label: "Week Change", value: weekImprovement > 0 ? `+${weekImprovement}` : `${weekImprovement}` },
          { label: "Day Streak", value: `${streak} 🔥` },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + i * 0.05 }}
            className="glass-card rounded-2xl p-3 text-center"
          >
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="font-display font-bold text-base">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Glow Score Line Graph */}
      {chartData.length >= 2 && (
        <Card className="rounded-3xl glass-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm">7-Day Glow Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                score: { label: "Glow Score", color: "hsl(var(--primary))" },
                skin: { label: "Hydration", color: "hsl(var(--glow-pink))" },
                texture: { label: "Texture", color: "hsl(160, 60%, 45%)" },
                acne: { label: "Acne Risk", color: "hsl(35, 80%, 55%)" },
              }}
              className="h-[180px] w-full"
            >
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="journeyGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="journeySkin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--glow-pink))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--glow-pink))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#journeyGlow)" dot={{ fill: "hsl(var(--primary))", r: 3 }} />
                <Area type="monotone" dataKey="skin" stroke="hsl(var(--glow-pink))" strokeWidth={1.5} fill="url(#journeySkin)" dot={{ fill: "hsl(var(--glow-pink))", r: 2 }} strokeDasharray="4 2" />
                <Area type="monotone" dataKey="texture" stroke="hsl(160, 60%, 45%)" strokeWidth={1} fill="none" dot={{ fill: "hsl(160, 60%, 45%)", r: 1.5 }} strokeDasharray="3 3" />
                <Area type="monotone" dataKey="acne" stroke="hsl(35, 80%, 55%)" strokeWidth={1} fill="none" dot={{ fill: "hsl(35, 80%, 55%)", r: 1.5 }} strokeDasharray="3 3" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="glass-card rounded-3xl p-4 space-y-2">
          <p className="text-xs font-display font-semibold text-foreground">Weekly Insights</p>
          <ul className="space-y-1.5">
            {insights.map((ins, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/80 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {ins}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Achievement Badges */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        <p className="text-xs font-display font-semibold text-foreground">Achievement Badges</p>
        <div className="grid grid-cols-2 gap-2">
          {BADGES.map(badge => {
            const earned = earnedBadges.includes(badge);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-2.5 rounded-2xl p-3 transition-all ${
                  earned
                    ? "glass-card border border-primary/20 shadow-[0_0_12px_hsl(var(--primary)/0.1)]"
                    : "bg-muted/30 opacity-50"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  earned ? "gradient-bg-subtle" : "bg-muted"
                }`}>
                  <badge.icon className={`w-4 h-4 ${earned ? badge.color : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className={`text-[11px] font-semibold ${earned ? "text-foreground" : "text-muted-foreground"}`}>
                    {badge.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{earned ? "Earned ✓" : "Keep scanning"}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default GlowJourneySection;
