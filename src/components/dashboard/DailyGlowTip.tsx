import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

const TIPS = [
  "Stay hydrated — your skin shows it first",
  "Apply sunscreen daily, even on cloudy days",
  "Get 7-8 hours of sleep for skin cell repair",
  "Cleanse your face twice daily for a clear glow",
  "Eat more antioxidant-rich fruits for radiance",
  "Avoid touching your face to prevent breakouts",
  "Use a gentle moisturizer right after washing",
  "Reduce sugar intake — it accelerates aging",
  "Change your pillowcase weekly for clearer skin",
  "Take 5-min breaks from screens to reduce eye strain",
  "Cold water splash in the morning boosts circulation",
  "Green tea has anti-inflammatory skin benefits",
  "Exfoliate gently 2x a week for smoother texture",
  "Vitamin C serum brightens and protects your skin",
];

const DailyGlowTip = () => {
  // Rotate tip based on day of year
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const tip = TIPS[dayOfYear % TIPS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card rounded-3xl p-4 flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-xl gradient-bg-subtle flex items-center justify-center shrink-0 mt-0.5">
        <Lightbulb className="w-4.5 h-4.5 text-primary" />
      </div>
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-display font-bold text-foreground">Today's Glow Tip</p>
        <p className="text-[12px] text-foreground/80 leading-relaxed">{tip}</p>
      </div>
    </motion.div>
  );
};

export default DailyGlowTip;
