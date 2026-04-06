import { Shield, Trash2, Brain, Lock } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  { icon: Shield, label: "Your selfie is private" },
  { icon: Trash2, label: "Photo deleted after analysis" },
  { icon: Brain, label: "AI guidance only, not medical" },
  { icon: Lock, label: "Secure encrypted processing" },
];

const TrustBadges = ({ className = "" }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
    className={`flex flex-wrap justify-center gap-3 ${className}`}
  >
    {badges.map((b) => (
      <div
        key={b.label}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 border border-border/50 text-xs text-muted-foreground"
      >
        <b.icon className="w-3 h-3 text-primary/70 shrink-0" />
        <span>{b.label}</span>
      </div>
    ))}
  </motion.div>
);

export default TrustBadges;
