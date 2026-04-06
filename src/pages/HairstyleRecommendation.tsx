import { useLatestAnalysis } from "@/hooks/useLatestAnalysis";
import GlowScoreGauge from "@/components/GlowScoreGauge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Scissors, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlan } from "@/hooks/usePlan";
import UpgradePrompt from "@/components/UpgradePrompt";

const HairstyleRecommendation = () => {
  const { analysis, loading } = useLatestAnalysis();
  const { isPaid } = usePlan();

  if (!isPaid) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link to="/results"><ArrowLeft className="w-4 h-4" /> Back to Results</Link>
        </Button>
        <UpgradePrompt title="Hairstyle Analysis is Premium" description="Upgrade to get AI-powered hairstyle recommendations based on your face shape." />
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

  const hairstyleData = analysis?.analysis_data?.hairstyle;
  const score = analysis?.hairstyle_score ?? 0;
  const description = hairstyleData?.description || "Hairstyle analysis based on your face shape.";
  const faceShape = hairstyleData?.face_shape || "Unknown";
  const suggestions = hairstyleData?.suggestions || [];

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link to="/results"><ArrowLeft className="w-4 h-4" /> Back to Results</Link>
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Hairstyle Recommendations</h1>
        <p className="text-muted-foreground">{description}</p>
      </motion.div>

      <div className="flex justify-center">
        <GlowScoreGauge score={score} size={160} label="Style Match" />
      </div>

      <div className="text-center">
        <Badge variant="secondary" className="text-sm px-4 py-1.5">
          Your Face Shape: <span className="font-bold ml-1">{faceShape}</span>
        </Badge>
      </div>

      <div className="space-y-4">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" />
          Top Matches
        </h2>
        {suggestions.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Card className="rounded-xl hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl gradient-bg-subtle flex items-center justify-center shrink-0 text-2xl">
                  💇
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display font-semibold">{s.name}</h3>
                    <span className="text-sm font-bold text-primary">{s.match}% match</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HairstyleRecommendation;
