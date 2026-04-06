import { useLatestAnalysis } from "@/hooks/useLatestAnalysis";
import AnalysisCategory from "@/components/AnalysisCategory";
import GlowScoreGauge from "@/components/GlowScoreGauge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Lightbulb, Loader2 } from "lucide-react";

const SkinAnalysis = () => {
  const { analysis, loading } = useLatestAnalysis();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const skinData = analysis?.analysis_data?.skin;
  const score = analysis?.skin_score ?? 0;
  const description = skinData?.description || "Skin quality analysis based on AI evaluation.";
  const details = skinData?.details || [];
  const tips = skinData?.tips || [];

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link to="/results"><ArrowLeft className="w-4 h-4" /> Back to Results</Link>
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Skin Quality</h1>
        <p className="text-muted-foreground">{description}</p>
      </motion.div>

      <div className="flex justify-center">
        <GlowScoreGauge score={score} size={180} label="Skin Quality Score" />
      </div>

      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg">Quality Metrics</h2>
        {details.map((d, i) => (
          <AnalysisCategory key={d.label} label={d.label} value={d.value} delay={i * 0.1} />
        ))}
      </div>

      {tips.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Improvement Tips
          </h2>
          {tips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="p-4 rounded-xl bg-muted/50 border border-border text-sm flex gap-3"
            >
              <span className="text-primary font-bold">{i + 1}.</span>
              {tip}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkinAnalysis;
