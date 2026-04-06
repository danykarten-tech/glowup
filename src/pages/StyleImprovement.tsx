import { useLatestAnalysis } from "@/hooks/useLatestAnalysis";
import GlowScoreGauge from "@/components/GlowScoreGauge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Shirt, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePlan } from "@/hooks/usePlan";
import UpgradePrompt from "@/components/UpgradePrompt";

const priorityColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
};

const StyleImprovement = () => {
  const { isPaid } = usePlan();
  const { analysis, loading } = useLatestAnalysis();

  if (!isPaid) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link to="/results"><ArrowLeft className="w-4 h-4" /> Back to Results</Link>
        </Button>
        <UpgradePrompt title="Style Analysis is Premium" description="Upgrade to get personalized style improvement recommendations." />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const styleData = analysis?.analysis_data?.style;
  const score = analysis?.style_score ?? 0;
  const description = styleData?.description || "Style analysis based on AI evaluation.";
  const recommendations = styleData?.recommendations || [];

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link to="/results"><ArrowLeft className="w-4 h-4" /> Back to Results</Link>
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Style Improvements</h1>
        <p className="text-muted-foreground">{description}</p>
      </motion.div>

      <div className="flex justify-center">
        <GlowScoreGauge score={score} size={160} label="Style Rating" />
      </div>

      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2">
          <Shirt className="w-5 h-5 text-primary" />
          Personalized Recommendations
        </h2>
        {recommendations.map((r, i) => (
          <motion.div
            key={r.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="p-4 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display font-semibold text-sm">{r.category}</span>
              <Badge className={`text-xs ${priorityColors[r.priority] || ""}`} variant="secondary">
                {r.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{r.tip}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StyleImprovement;
