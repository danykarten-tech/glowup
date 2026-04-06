import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, ShieldCheck } from "lucide-react";

interface SkinMetricCardProps {
  label: string;
  score: number | null;
  reasoning: string;
  action: string;
  confidence: "high" | "moderate" | "early";
  trend?: "up" | "down" | "neutral";
  trendText?: string;
  delay?: number;
  color: string;
}

const confidenceLabels: Record<string, { text: string; color: string }> = {
  high: { text: "High confidence", color: "text-emerald-500" },
  moderate: { text: "Moderate confidence", color: "text-amber-500" },
  early: { text: "Early visual pattern detected", color: "text-muted-foreground" },
};

const SkinBreakdownCard = ({
  label,
  score,
  reasoning,
  action,
  confidence,
  trend = "neutral",
  trendText,
  delay = 0,
  color,
}: SkinMetricCardProps) => {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-400" : "text-muted-foreground";
  const displayScore = score ?? 0;
  const conf = confidenceLabels[confidence];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-3xl p-4 space-y-2.5 col-span-1"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">{label}</h4>
        <div className="flex items-center gap-1">
          {trendText && (
            <span className={`text-[9px] font-medium ${trendColor}`}>{trendText}</span>
          )}
          <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
        </div>
      </div>

      {/* Score + Confidence */}
      <div>
        <span className="text-2xl font-display font-bold text-foreground">{displayScore}%</span>
        <div className="flex items-center gap-1 mt-0.5">
          <ShieldCheck className={`w-3 h-3 ${conf.color}`} />
          <span className={`text-[10px] font-medium ${conf.color}`}>{conf.text}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${displayScore}%` }}
          transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
        />
      </div>

      {/* Reasoning */}
      <p className="text-[11px] text-foreground/80 leading-relaxed">{reasoning}</p>

      {/* Action */}
      <div className="bg-primary/5 rounded-xl px-3 py-2">
        <p className="text-[10px] text-primary font-medium leading-relaxed">💡 {action}</p>
      </div>
    </motion.div>
  );
};

export default SkinBreakdownCard;
