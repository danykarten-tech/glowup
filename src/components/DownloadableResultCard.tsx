import { forwardRef } from "react";
import { AnalysisResult } from "@/hooks/useLatestAnalysis";
import { useLatestAnalysis } from "@/hooks/useLatestAnalysis";

interface Props {
  analysisOverride?: AnalysisResult | null;
}

const getScoreLabel = (score: number | null) => {
  if (score === null) return "—";
  if (score >= 95) return "Extraordinary";
  if (score >= 90) return "Very Good";
  if (score >= 80) return "Good";
  if (score >= 75) return "Average";
  return "Needs Work";
};

const getScoreColor = (score: number | null) => {
  if (score === null) return "#6b7280";
  if (score >= 90) return "#22c55e";
  if (score >= 80) return "#3b82f6";
  if (score >= 75) return "#f59e0b";
  return "#ef4444";
};

const getScoreBg = (score: number | null) => {
  if (score === null) return "#1e1e3a";
  if (score >= 90) return "#052e16";
  if (score >= 80) return "#0c1a3d";
  if (score >= 75) return "#2a1f00";
  return "#2a0a0a";
};

const DownloadableResultCard = forwardRef<HTMLDivElement, Props>(({ analysisOverride }, ref) => {
  const { analysis: latestAnalysis } = useLatestAnalysis();
  const analysis = analysisOverride || latestAnalysis;

  if (!analysis) return null;

  const categories = [
    { label: "Symmetry", icon: "🔲", score: analysis.symmetry_score },
    { label: "Skin", icon: "✨", score: analysis.skin_score },
    { label: "Hairstyle", icon: "💇", score: analysis.hairstyle_score },
    { label: "Style", icon: "👔", score: analysis.style_score },
  ];

  const size = 180;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (analysis.overall_score / 100) * circumference;
  const overallColor = getScoreColor(analysis.overall_score);

  return (
    <div
      ref={ref}
      style={{
        width: 380,
        borderRadius: 24,
        overflow: "hidden",
        background: "linear-gradient(145deg, #9333ea, #ec4899, #f97316)",
        padding: 3,
        fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #0f0a1a 0%, #1a1030 50%, #0f0a1a 100%)",
          borderRadius: 22,
          padding: "32px 24px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>✨</div>
          <h3
            style={{
              fontSize: 24,
              fontWeight: 800,
              background: "linear-gradient(135deg, #c084fc, #f472b6, #fb923c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            My FaceNova Score
          </h3>
          <p style={{ fontSize: 12, color: "#71717a", margin: "6px 0 0 0", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
            AI-Powered Beauty Analysis
          </p>
        </div>

        {/* Score Circle */}
        <div style={{ position: "relative", width: size, height: size }}>
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e1e3a" strokeWidth="10" />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#dlGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
            />
            <defs>
              <linearGradient id="dlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1,
              }}
            >
              {analysis.overall_score}
            </span>
            <span style={{ fontSize: 13, color: "#71717a", marginTop: 4, fontWeight: 500 }}>/ 100</span>
          </div>
        </div>

        {/* Overall Label */}
        <div
          style={{
            background: `${overallColor}18`,
            border: `1px solid ${overallColor}40`,
            borderRadius: 20,
            padding: "6px 20px",
            fontSize: 14,
            fontWeight: 700,
            color: overallColor,
            letterSpacing: "0.02em",
          }}
        >
          {getScoreLabel(analysis.overall_score)}
        </div>

        {/* Category Scores */}
        <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {categories.map((cat) => {
            const color = getScoreColor(cat.score);
            const bg = getScoreBg(cat.score);
            return (
              <div
                key={cat.label}
                style={{
                  background: bg,
                  border: `1px solid ${color}25`,
                  borderRadius: 14,
                  padding: "14px 12px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 16, marginBottom: 4 }}>{cat.icon}</div>
                <p
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: color,
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  {cat.score ?? "—"}
                  {cat.score !== null && <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.7 }}>%</span>}
                </p>
                <p style={{ fontSize: 11, color: "#a1a1aa", margin: "6px 0 0 0", fontWeight: 600, letterSpacing: "0.02em" }}>
                  {cat.label}
                </p>
                <p style={{ fontSize: 9, color: color, margin: "2px 0 0 0", fontWeight: 600, opacity: 0.8 }}>
                  {getScoreLabel(cat.score)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            width: "100%",
            borderTop: "1px solid #ffffff10",
            paddingTop: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, color: "#52525b" }}>
            {new Date(analysis.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              background: "linear-gradient(135deg, #9333ea, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            FaceNova
          </span>
        </div>
      </div>
    </div>
  );
});

DownloadableResultCard.displayName = "DownloadableResultCard";

export default DownloadableResultCard;
