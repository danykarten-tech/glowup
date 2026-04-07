import { motion } from "framer-motion";
import { Bell, Target, BarChart3, Lock, Crown, Sparkles, Trophy, Star } from "lucide-react";
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
      {/* 7-Day Glow Challenge — upgraded */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="relative rounded-3xl overflow-hidden"
      >
        <div className="absolute inset-0 gradient-bg opacity-[0.06]" />
        <div className="relative glass-card rounded-3xl p-5 space-y-4 border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-sm">7-Day Glow Challenge</h3>
            </div>
            {challengeComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20"
              >
                <Star className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-semibold text-emerald-400">Complete</span>
              </motion.div>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{scansThisWeek} of 7 daily scans</span>
              <span className="font-display font-bold gradient-text text-sm">{Math.round(challengeProgress)}%</span>
            </div>
            <div className="relative">
              <Progress value={challengeProgress} className="h-3 rounded-full" />
              {/* Day markers */}
              <div className="flex justify-between mt-1.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full transition-all ${
                      i < scansThisWeek
                        ? "gradient-bg shadow-sm"
                        : "bg-muted-foreground/20"
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reward text */}
          <div className="glass-card rounded-2xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl gradient-bg-subtle flex items-center justify-center shrink-0">
              <Crown className="w-4 h-4 text-primary" />
            </div>
            <p className="text-[11px] text-foreground/80 leading-relaxed">
              {challengeComplete
                ? "You've unlocked premium insights! Check your latest report."
                : `Complete ${scansRemaining} more scan${scansRemaining !== 1 ? "s" : ""} to unlock premium insights`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progress nudges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-3xl p-4 space-y-3"
      >
        <p className="text-xs font-display font-semibold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Keep the Momentum
        </p>
        <div className="space-y-2">
          {[
            { icon: Bell, text: "Come back tomorrow for your next progress check", show: true },
            { icon: BarChart3, text: `${scansRemaining} more scan${scansRemaining !== 1 ? "s" : ""} to complete your weekly glow challenge`, show: scansRemaining > 0 },
            { icon: Sparkles, text: "Your best results happen with consistent scans", show: true },
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

            <Button className="w-full gradient-bg border-0 text-primary-foreground rounded-2xl gap-2 btn-glow" asChild>
              <Link to="/plans">
                <Crown className="w-4 h-4" />
                Unlock My Full Glow Journey
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EngagementCards;
