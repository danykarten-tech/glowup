import { useLatestAnalysis } from "@/hooks/useLatestAnalysis";
import AnalysisCategory from "@/components/AnalysisCategory";
import GlowScoreGauge from "@/components/GlowScoreGauge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import SignedImage from "@/components/SignedImage";

const SymmetryAnalysis = () => {
  const { analysis, loading } = useLatestAnalysis();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const symmetryData = analysis?.analysis_data?.symmetry;
  const score = analysis?.symmetry_score ?? 0;
  const description = symmetryData?.description || "Facial symmetry analysis based on AI evaluation.";
  const details = symmetryData?.details || [];

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link to="/results"><ArrowLeft className="w-4 h-4" /> Back to Results</Link>
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Face Symmetry</h1>
        <p className="text-muted-foreground">{description}</p>
      </motion.div>

      <div className="flex justify-center">
        <GlowScoreGauge score={score} size={180} label="Symmetry Score" />
      </div>

      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg">Detailed Breakdown</h2>
        {details.map((d, i) => (
          <AnalysisCategory key={d.label} label={d.label} value={d.value} delay={i * 0.1} />
        ))}
      </div>

      {analysis?.photo_url && (
        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-center">
          <SignedImage
            storagePath={analysis.photo_url}
            alt="Your selfie"
            className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
          />
          <p className="text-sm text-muted-foreground">
            Symmetry analysis based on your uploaded photo
          </p>
        </div>
      )}
    </div>
  );
};

export default SymmetryAnalysis;
