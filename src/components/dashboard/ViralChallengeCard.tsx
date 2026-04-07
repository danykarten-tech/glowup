import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share2, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface ViralChallengeCardProps {
  latestScore: number | null;
}

const ViralChallengeCard = ({ latestScore }: ViralChallengeCardProps) => {
  const score = latestScore ?? 0;

  const handleShare = async () => {
    const text = `I got ${score}% glow score 😎 Can you beat me? Try FaceNova!`;
    const url = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({ title: "FaceNova Glow Challenge", text, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast({ title: "Copied!", description: "Share message copied to clipboard." });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="relative rounded-3xl overflow-hidden"
    >
      <div className="absolute inset-0 gradient-bg opacity-10" />
      <div className="relative glass-card rounded-3xl p-5 space-y-4 border border-primary/15">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-sm">Challenge Your Friends</h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-xs text-muted-foreground">Your Glow Score</p>
            <p className="font-display text-3xl font-extrabold gradient-text">
              {score > 0 ? score : "—"}
            </p>
          </div>

          <Button
            onClick={handleShare}
            className="gradient-bg border-0 text-primary-foreground rounded-2xl gap-2 btn-glow"
            disabled={score === 0}
          >
            <Share2 className="w-4 h-4" />
            Share My Score
          </Button>
        </div>

        <Link
          to="/glow-challenge"
          className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <Trophy className="w-3.5 h-3.5" />
          View Leaderboard & Challenges
        </Link>
      </div>
    </motion.div>
  );
};

export default ViralChallengeCard;
