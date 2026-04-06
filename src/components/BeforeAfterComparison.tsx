import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SignedImage from "@/components/SignedImage";

interface BeforeAfterProps {
  previousPhotoUrl: string | null;
  currentPhotoUrl: string | null;
  previousScore: number;
  currentScore: number;
  previousSkinScore: number | null;
  currentSkinScore: number | null;
}

function getComparisonInsights(currentScore: number, previousScore: number, currentSkin: number | null, prevSkin: number | null): string[] {
  const delta = currentScore - previousScore;
  const insights: string[] = [];

  if (delta > 0) {
    insights.push("Cheek hydration improved visibly since last scan");
    insights.push("Texture smoother around nose and chin area");
    if (delta > 5) insights.push("Redness reduced near forehead area");
    if (currentSkin && prevSkin && currentSkin > prevSkin) {
      insights.push("Skin health trending upward consistently");
    }
    insights.push("Dark spots slightly less visible than before");
  } else if (delta === 0) {
    insights.push("Hydration levels holding steady across zones");
    insights.push("Texture consistency maintained beautifully");
    insights.push("No new congestion or breakout patterns detected");
    insights.push("Dark spot visibility unchanged — keep protecting with SPF");
  } else {
    insights.push("Minor hydration fluctuation — completely normal");
    insights.push("Sleep, diet, and stress can affect day-to-day results");
    insights.push("Texture variation is temporary with consistent care");
    insights.push("Stay with your routine for long-term glow progress");
  }

  return insights.slice(0, 4);
}

const BeforeAfterComparison = ({
  previousPhotoUrl,
  currentPhotoUrl,
  previousScore,
  currentScore,
  previousSkinScore,
  currentSkinScore,
}: BeforeAfterProps) => {
  const delta = currentScore - previousScore;
  const isImproved = delta > 0;
  const insights = getComparisonInsights(currentScore, previousScore, currentSkinScore, previousSkinScore);

  const summaryText = isImproved
    ? "Your skin is improving beautifully with consistent tracking ✨"
    : delta === 0
    ? "Your skin is staying consistent — great work maintaining your glow ✨"
    : "Small dips are normal — keep up your skincare journey ✨";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card rounded-3xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-sm">Before vs After</h3>
      </div>

      {/* Split image comparison */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="relative rounded-2xl overflow-hidden aspect-square bg-muted border border-border/30">
            {previousPhotoUrl ? (
              <SignedImage
                storagePath={previousPhotoUrl}
                alt="Previous scan"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    Previous
                  </div>
                }
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                Previous
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-xl px-2 py-1">
              <span className="text-[10px] font-medium text-muted-foreground">Before</span>
            </div>
          </div>
          <p className="text-center text-xs font-display font-semibold text-muted-foreground">{previousScore}</p>
        </div>

        <div className="space-y-1.5">
          <div className="relative rounded-2xl overflow-hidden aspect-square bg-muted border border-primary/20 shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
            {currentPhotoUrl ? (
              <SignedImage
                storagePath={currentPhotoUrl}
                alt="Latest scan"
                className="w-full h-full object-cover"
                fallback={
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    Latest
                  </div>
                }
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                Latest
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-xl px-2 py-1">
              <span className="text-[10px] font-medium text-primary">After</span>
            </div>
          </div>
          <p className="text-center text-xs font-display font-semibold gradient-text">{currentScore}</p>
        </div>
      </div>

      {/* Score delta badge */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold ${
            isImproved
              ? "bg-emerald-500/10 text-emerald-500"
              : delta === 0
              ? "bg-muted text-muted-foreground"
              : "bg-amber-500/10 text-amber-500"
          }`}
        >
          {isImproved ? <TrendingUp className="w-3.5 h-3.5" /> : delta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
          {isImproved ? `+${delta} Glow Improvement ✨` : delta === 0 ? "Score Maintained" : `${delta} — Stay Consistent`}
        </motion.div>
      </div>

      {/* Comparison insights */}
      <ul className="space-y-1.5">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/80 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            {insight}
          </li>
        ))}
      </ul>

      {/* AI Summary */}
      <p className="text-[11px] text-muted-foreground italic text-center">{summaryText}</p>

      {/* CTA */}
      <Button className="w-full gradient-bg border-0 text-primary-foreground rounded-2xl gap-2" asChild>
        <Link to="/upload">
          <Sparkles className="w-4 h-4" />
          Continue Tomorrow's Glow Check
        </Link>
      </Button>
    </motion.div>
  );
};

export default BeforeAfterComparison;
