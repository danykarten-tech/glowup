import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const PremiumTeaser = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative rounded-3xl overflow-hidden"
    >
      {/* Blurred preview layer */}
      <div className="glass-card rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-sm">Unlock Full Glow Plan</h3>
        </div>

        {/* Blurred feature cards */}
        <div className="relative rounded-2xl overflow-hidden">
          <div className="space-y-2 blur-[5px] pointer-events-none select-none opacity-60">
            {[
              { icon: Sparkles, text: "AI Personalized Routine" },
              { icon: ShieldCheck, text: "Advanced Skin Insights" },
              { icon: Crown, text: "Unlimited Scan History" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                <div className="w-8 h-8 rounded-lg gradient-bg-subtle flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs font-medium">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Button className="w-full gradient-bg border-0 text-primary-foreground rounded-2xl gap-2 btn-glow" asChild>
          <Link to="/plans">
            <Crown className="w-4 h-4" />
            Upgrade Now
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default PremiumTeaser;
