import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardHeroProps {
  firstName: string;
  improvement: number;
  hasHistory: boolean;
}

const DashboardHero = ({ firstName, improvement, hasHistory }: DashboardHeroProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl"
    >
      {/* Gradient background with glow */}
      <div className="absolute inset-0 gradient-bg opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30" />
      
      {/* Floating orbs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-3xl floating" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5 blur-2xl floating-delayed" />

      <div className="relative px-6 py-8 text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-primary-foreground leading-tight">
            Let's Boost Your Glow Today
            <Sparkles className="inline w-6 h-6 ml-1.5 text-yellow-300" />
          </h1>
        </motion.div>

        {hasHistory && improvement !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-1.5"
          >
            <TrendingUp className={`w-4 h-4 ${improvement > 0 ? "text-emerald-300" : "text-red-300"}`} />
            <p className="text-sm text-primary-foreground/90 font-medium">
              {improvement > 0 ? `+${improvement} from last scan — you're glowing!` : `${improvement} since last — let's bounce back!`}
            </p>
          </motion.div>
        )}

        {!hasHistory && (
          <p className="text-sm text-primary-foreground/80">
            Hey {firstName}, ready for your first glow-up analysis?
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            size="lg"
            className="bg-background text-foreground hover:bg-background/90 font-bold rounded-2xl gap-2 px-8 shadow-xl shadow-black/30 btn-glow border border-border/50"
            asChild
          >
            <Link to="/upload">
              <Camera className="w-5 h-5" />
              Scan My Face Now
            </Link>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardHero;
