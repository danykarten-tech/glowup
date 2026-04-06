import { motion } from "framer-motion";
import { Bell, Target, BarChart3, Lock, Crown, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface EngagementCardsProps {
  scansThisWeek: number;
  isPaid: boolean;
  totalScans: number;
}

const EngagementCards = ({ scansThisWeek, isPaid, totalScans }: EngagementCardsProps) => {
  const scansRemaining = Math.max(0, 7 - scansThisWeek);
  const challengeProgress = Math.min(100, (scansThisWeek / 7) * 100);
  const challengeComplete = scansThisWeek >= 7;

  return (
    <div className="space-y-3">
      {/* 7-Day Glow Challenge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-3xl p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-sm">7-Day Glow Challenge</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{scansThisWeek}/7 scans this week</span>
            <span className="font-display font-semibold text-primary">{Math.round(challengeProgress)}%</span>
          </div>
          <Progress value={challengeProgress} className="h-2.5 rounded-full" />
          <p className="text-[11px] text-muted-foreground text-center">
            {challengeComplete
              ? "🎉 Challenge complete! You've earned your Glow Transformation badge!"
              : `Complete ${scansRemaining} more scan${scansRemaining !== 1 ? "s" : ""} to unlock your glow transformation badge`}
          </p>
        </div>
      </motion.div>

      {/* Return triggers */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-3xl p-4 space-y-3"
      >
        <p className="text-xs font-display font-semibold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Glow Challenge Progress
        </p>
        <div className="space-y-2">
          {[
            {
              icon: Bell,
              text: "Come back tomorrow for your next progress check",
              show: true,
            },
            {
              icon: BarChart3,
              text: `${scansRemaining} more scan${scansRemaining !== 1 ? "s" : ""} to complete your weekly glow challenge`,
              show: scansRemaining > 0,
            },
            {
              icon: Sparkles,
              text: "Your best results happen with consistent scans",
              show: true,
            },
          ]
            .filter(t => t.show)
            .map((trigger, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-muted/30">
                <div className="w-7 h-7 rounded-lg gradient-bg-subtle flex items-center justify-center shrink-0 mt-0.5">
                  <trigger.icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-[11px] text-foreground/80 leading-relaxed">{trigger.text}</p>
              </div>
            ))}
        </div>
      </motion.div>

      {/* Premium paywall for free users */}
      {!isPaid && totalScans > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-sm">Unlock Full Glow History</h3>
            </div>

            {/* Blurred preview */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="space-y-2 blur-[6px] pointer-events-none select-none">
                {[85, 78, 82].map((score, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted" />
                      <div>
                        <p className="text-xs font-medium">Glow Analysis</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(Date.now() - (i + 4) * 86400000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="font-display font-bold text-primary">{score}</span>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
              Unlock full glow history and long-term progress tracking
            </p>

            {/* Plan features */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="glass-card rounded-2xl p-3 space-y-1.5">
                <p className="font-semibold text-foreground">Glow Plus</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 30-day comparison</li>
                  <li>• Full progress charts</li>
                  <li>• Routine evolution</li>
                </ul>
              </div>
              <div className="glass-card rounded-2xl p-3 space-y-1.5 border border-primary/20">
                <p className="font-semibold gradient-text">Glow Pro</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Unlimited history</li>
                  <li>• AI improvement timeline</li>
                  <li>• Deep before/after</li>
                </ul>
              </div>
            </div>

            <Button className="w-full gradient-bg border-0 text-primary-foreground rounded-2xl gap-2" asChild>
              <Link to="/plans">
                <Crown className="w-4 h-4" />
                Unlock My Full Glow Journey
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Trust note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center px-4 py-3"
      >
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
          Progress comparisons are based on visible skin surface changes between scans.
        </p>
      </motion.div>
    </div>
  );
};

export default EngagementCards;
