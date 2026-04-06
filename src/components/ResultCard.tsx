import GlowScoreGauge from "./GlowScoreGauge";
import { useLatestAnalysis, AnalysisResult } from "@/hooks/useLatestAnalysis";
import { forwardRef } from "react";

interface ResultCardProps {
  analysisOverride?: AnalysisResult | null;
}

const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(({ analysisOverride }, ref) => {
  const { analysis: latestAnalysis } = useLatestAnalysis();
  const analysis = analysisOverride || latestAnalysis;

  if (!analysis) return null;

  const categories = [
    { label: "Symmetry", score: analysis.symmetry_score },
    { label: "Skin", score: analysis.skin_score },
    { label: "Hairstyle", score: analysis.hairstyle_score },
    { label: "Style", score: analysis.style_score },
  ];

  return (
    <div ref={ref} className="w-80 rounded-2xl overflow-hidden gradient-bg p-[1px]">
      <div className="bg-card rounded-2xl p-6 flex flex-col items-center gap-4">
        <div className="text-center">
          <h3 className="font-display font-bold text-lg text-foreground">My FaceNova Score</h3>
          <p className="text-xs text-muted-foreground">Powered by FaceNova</p>
        </div>
        <GlowScoreGauge score={analysis.overall_score} size={140} />
        <div className="w-full grid grid-cols-2 gap-3 text-center text-sm">
          {categories.map((cat) => (
            <div key={cat.label} className="bg-muted rounded-lg p-2">
              <p className="font-semibold text-foreground">{cat.score ?? "—"}%</p>
              <p className="text-xs text-muted-foreground">{cat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">facenova.app</p>
      </div>
    </div>
  );
});

ResultCard.displayName = "ResultCard";

export default ResultCard;
