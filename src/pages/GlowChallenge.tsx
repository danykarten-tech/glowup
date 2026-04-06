import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Trophy, Users, Share2, Sparkles, Crown, Medal,
  Gift, ChevronRight, Flame, Star, Zap, Copy, Check, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useLatestAnalysis } from "@/hooks/useLatestAnalysis";
import GlowScoreGauge from "@/components/GlowScoreGauge";
import AnimatedCounter from "@/components/AnimatedCounter";

// Leaderboard entry type
interface LeaderEntry {
  challenger_id: string;
  challenger_name: string | null;
  challenger_score: number;
  created_at: string;
}

// Podium medal config
const podiumConfig = [
  { rank: 1, icon: Crown, color: "from-amber-400 to-yellow-500", glow: "shadow-[0_0_30px_rgba(251,191,36,0.4)]", size: "w-16 h-16", textSize: "text-2xl" },
  { rank: 2, icon: Medal, color: "from-slate-300 to-slate-400", glow: "shadow-[0_0_20px_rgba(148,163,184,0.3)]", size: "w-12 h-12", textSize: "text-xl" },
  { rank: 3, icon: Medal, color: "from-amber-600 to-amber-700", glow: "shadow-[0_0_20px_rgba(180,83,9,0.3)]", size: "w-12 h-12", textSize: "text-xl" },
];

const GlowChallenge = () => {
  const { user } = useAuth();
  const { analysis } = useLatestAnalysis();
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [challengeSent, setChallengeSent] = useState(false);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [userRank, setUserRank] = useState<number | null>(null);

  const myScore = analysis?.overall_score ?? 0;
  const shareMessage = `I got ${myScore}% glow score 😎 Can you beat me? Try the FaceNova Glow Challenge!`;
  const shareUrl = window.location.origin;

  // Fetch leaderboard (top scores from all challenges this week)
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("glow_challenges")
        .select("challenger_id, challenger_name, challenger_score, created_at")
        .gte("created_at", startOfWeek.toISOString())
        .order("challenger_score", { ascending: false })
        .limit(20);

      if (!error && data) {
        // Deduplicate by challenger_id, keep highest score
        const seen = new Map<string, LeaderEntry>();
        data.forEach((entry) => {
          const existing = seen.get(entry.challenger_id);
          if (!existing || entry.challenger_score > existing.challenger_score) {
            seen.set(entry.challenger_id, entry);
          }
        });
        const sorted = Array.from(seen.values()).sort((a, b) => b.challenger_score - a.challenger_score);
        setLeaderboard(sorted.slice(0, 10));

        // Find user rank
        if (user) {
          const rank = sorted.findIndex((e) => e.challenger_id === user.id);
          setUserRank(rank >= 0 ? rank + 1 : null);
        }
      }

      // Get total challenges sent by user
      if (user) {
        const { count } = await supabase
          .from("glow_challenges")
          .select("id", { count: "exact", head: true })
          .eq("challenger_id", user.id);
        setTotalChallenges(count || 0);
      }

      setLoading(false);
    };

    fetchLeaderboard();
  }, [user]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${shareMessage}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!", description: "Share it with friends to challenge them." });
  };

  const handleSendChallenge = async () => {
    if (!user || !analysis) {
      toast({ title: "Scan required", description: "Upload a selfie first to get your glow score!", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("glow_challenges").insert({
      challenger_id: user.id,
      challenger_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonymous",
      challenger_score: myScore,
      challenged_friend_name: friendName || null,
      status: "pending",
    });

    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
      return;
    }

    setChallengeSent(true);
    setTotalChallenges((prev) => prev + 1);
    setTimeout(() => setChallengeSent(false), 3000);

    // Share via Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({ title: "Glow Challenge", text: shareMessage, url: shareUrl });
      } catch {}
    }

    setFriendName("");
    toast({ title: "Challenge sent! 🔥", description: "Your friend will receive the challenge." });
  };

  const handleWhatsAppShare = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareMessage}\n${shareUrl}`)}`,
      "_blank"
    );
  };

  const invitesNeeded = Math.max(0, 3 - totalChallenges);
  const premiumUnlocked = totalChallenges >= 3;

  return (
    <div className="p-4 md:p-10 max-w-3xl mx-auto space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card rounded-3xl p-6 text-center space-y-4 overflow-hidden"
      >
        {/* Floating decorations */}
        <motion.div
          className="absolute top-4 right-6 text-2xl"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🔥
        </motion.div>
        <motion.div
          className="absolute top-8 left-6 text-xl"
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.div>
        <motion.div
          className="absolute bottom-6 right-10 text-lg"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          ⭐
        </motion.div>

        <div className="flex items-center justify-center gap-2">
          <Flame className="w-6 h-6 text-amber-500" />
          <h1 className="font-display text-2xl md:text-3xl font-extrabold gradient-text">
            Glow Challenge
          </h1>
          <Flame className="w-6 h-6 text-amber-500" />
        </div>

        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Challenge friends, climb the leaderboard, and prove who has the best glow! 🏆
        </p>

        {/* User's score */}
        {analysis ? (
          <div className="flex flex-col items-center gap-2">
            <GlowScoreGauge score={myScore} size={140} label="Your Score" />
            {userRank && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20"
              >
                <Trophy className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Rank #{userRank} this week</span>
              </motion.div>
            )}
          </div>
        ) : (
          <Button className="gradient-bg border-0 text-primary-foreground btn-glow" asChild>
            <Link to="/upload">
              <Sparkles className="w-4 h-4 mr-2" />
              Get Your Glow Score First
            </Link>
          </Button>
        )}
      </motion.div>

      {/* Challenge a Friend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-3xl p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-sm">Challenge a Friend</h2>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Friend's name (optional)"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            className="w-full bg-muted/30 border border-border/30 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Share message preview */}
        <div className="bg-muted/20 rounded-2xl p-3 border border-border/20">
          <p className="text-xs text-foreground/80 italic">"{shareMessage}"</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleSendChallenge}
            className="gradient-bg border-0 text-primary-foreground btn-glow gap-2 rounded-2xl"
            disabled={!analysis}
          >
            <AnimatePresence mode="wait">
              {challengeSent ? (
                <motion.span key="sent" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                  <Check className="w-4 h-4" /> Sent!
                </motion.span>
              ) : (
                <motion.span key="send" className="flex items-center gap-1">
                  <Zap className="w-4 h-4" /> Challenge
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          <Button
            variant="outline"
            onClick={handleWhatsAppShare}
            className="gap-2 rounded-2xl border-border/30"
            disabled={!analysis}
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
          className="w-full gap-2 text-xs text-muted-foreground"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy challenge link"}
        </Button>
      </motion.div>

      {/* Reward Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-3xl p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-sm">Invite Reward</h2>
        </div>

        <p className="text-xs text-muted-foreground">
          Challenge <span className="text-primary font-semibold">3 friends</span> to unlock a premium report! 🎁
        </p>

        {/* Progress circles */}
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3].map((step) => {
            const completed = totalChallenges >= step;
            return (
              <motion.div
                key={step}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + step * 0.1, type: "spring" }}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    completed
                      ? "bg-primary/20 border-primary glow-shadow-sm"
                      : "bg-muted/30 border-border/30"
                  }`}
                >
                  {completed ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Check className="w-5 h-5 text-primary" />
                    </motion.div>
                  ) : (
                    <Users className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${completed ? "text-primary" : "text-muted-foreground"}`}>
                  Friend {step}
                </span>
              </motion.div>
            );
          })}

          {/* Arrow to reward */}
          <ChevronRight className="w-4 h-4 text-muted-foreground" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                premiumUnlocked
                  ? "bg-gradient-to-br from-amber-400/20 to-amber-600/20 border-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                  : "bg-muted/20 border-border/30 border-dashed"
              }`}
            >
              {premiumUnlocked ? (
                <Crown className="w-6 h-6 text-amber-500" />
              ) : (
                <Gift className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <span className={`text-[10px] font-semibold ${premiumUnlocked ? "text-amber-500" : "text-muted-foreground"}`}>
              {premiumUnlocked ? "Unlocked!" : "Premium"}
            </span>
          </motion.div>
        </div>

        {premiumUnlocked ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-center"
          >
            <p className="text-xs font-semibold text-amber-500">🎉 Premium report unlocked! Check your results.</p>
          </motion.div>
        ) : (
          <p className="text-[10px] text-muted-foreground text-center">
            {invitesNeeded} more invite{invitesNeeded !== 1 ? "s" : ""} to unlock
          </p>
        )}
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold">Weekly Leaderboard</h2>
          </div>
          <span className="text-[10px] text-muted-foreground">Top Glow Scores</span>
        </div>

        {loading ? (
          <div className="glass-card rounded-3xl p-8 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-6 h-6 text-primary" />
            </motion.div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center space-y-3">
            <Trophy className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">No challenges this week yet.</p>
            <p className="text-xs text-muted-foreground">Be the first to start the Glow Challenge!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 1 && (
              <div className="flex items-end justify-center gap-3 py-4">
                {[1, 0, 2].map((podiumIndex) => {
                  const entry = leaderboard[podiumIndex];
                  if (!entry) return <div key={podiumIndex} className="w-20" />;
                  const config = podiumConfig[podiumIndex];
                  const Icon = config.icon;
                  const isCurrentUser = user && entry.challenger_id === user.id;
                  const height = podiumIndex === 0 ? "h-28" : podiumIndex === 1 ? "h-24" : "h-20";

                  return (
                    <motion.div
                      key={podiumIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + podiumIndex * 0.1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className={`relative ${config.size} rounded-full bg-gradient-to-br ${config.color} ${config.glow} flex items-center justify-center`}>
                        <span className={`font-display font-extrabold text-white ${config.textSize}`}>
                          {entry.challenger_score}
                        </span>
                        <Icon className="absolute -top-2 -right-1 w-5 h-5 text-amber-300 drop-shadow-lg" />
                      </div>
                      <div className={`glass-card rounded-2xl px-3 ${height} flex flex-col items-center justify-end pb-2 w-20 ${isCurrentUser ? "border border-primary/30 glow-shadow-sm" : ""}`}>
                        <p className="text-[10px] font-semibold text-foreground truncate w-full text-center">
                          {isCurrentUser ? "You" : entry.challenger_name || "Anonymous"}
                        </p>
                        <p className="text-[9px] text-muted-foreground">#{config.rank}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Rest of leaderboard */}
            {leaderboard.slice(3).map((entry, i) => {
              const rank = i + 4;
              const isCurrentUser = user && entry.challenger_id === user.id;
              return (
                <motion.div
                  key={entry.challenger_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className={`glass-card rounded-2xl px-4 py-3 flex items-center gap-3 ${
                    isCurrentUser ? "border border-primary/20 glow-shadow-sm" : ""
                  }`}
                >
                  <span className="text-sm font-display font-bold text-muted-foreground w-6 text-center">
                    {rank}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {(entry.challenger_name || "A")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {isCurrentUser ? "You" : entry.challenger_name || "Anonymous"}
                    </p>
                  </div>
                  <AnimatedCounter
                    value={`${entry.challenger_score}%`}
                    className="text-sm font-display font-bold gradient-text"
                  />
                </motion.div>
              );
            })}
          </>
        )}
      </motion.div>

      {/* Join CTA for users without a scan */}
      {!analysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-3xl gradient-bg border-0">
            <CardContent className="p-5 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-primary-foreground mx-auto" />
              <h3 className="font-display font-bold text-primary-foreground">Ready to join the challenge?</h3>
              <p className="text-xs text-primary-foreground/80">Upload a selfie to get your glow score and compete!</p>
              <Button variant="secondary" className="rounded-2xl" asChild>
                <Link to="/upload">Start My Glow Scan</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default GlowChallenge;
