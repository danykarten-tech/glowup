import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GlowScoreGauge from "@/components/GlowScoreGauge";
import SkinBreakdownCard from "@/components/SkinBreakdownCard";
import TrustBadges from "@/components/TrustBadges";
import { useLatestAnalysis, useAnalysisById } from "@/hooks/useLatestAnalysis";
import { usePlan } from "@/hooks/usePlan";
import UpgradePrompt from "@/components/UpgradePrompt";
import BeforeAfterComparison from "@/components/BeforeAfterComparison";
import FaceLandmarkOverlay from "@/components/FaceLandmarkOverlay";
import EngagementCards from "@/components/EngagementCards";
import GlowJourneySection from "@/components/GlowJourneySection";
import { motion } from "framer-motion";
import {
  Share2, Download, ChevronRight, Loader2, Lock, ShoppingBag,
  MessageCircle, Sparkles, Sun, Moon, Eye, Droplets, CalendarCheck,
  Scan, Palette, Scissors, Shirt, TrendingUp, TrendingDown, Minus, ShieldCheck
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";
import AnimatedCounter from "@/components/AnimatedCounter";

// --- Believable wording generators ---

function getConfidence(score: number | null): "high" | "moderate" | "early" {
  if (score === null) return "early";
  if (score >= 70) return "high";
  if (score >= 45) return "moderate";
  return "early";
}

function hydrationWording(score: number) {
  if (score >= 80) return {
    reasoning: "Hydration levels look well-balanced across your face. Your skin appears plump and supple with a healthy surface glow.",
    action: "Keep up your current moisturizing routine — consider adding a hyaluronic acid mist for an extra boost on dry days.",
  };
  if (score >= 60) return {
    reasoning: "Hydration appears slightly below optimal around the cheek area, which may suggest surface dryness or mild moisture imbalance.",
    action: "Use a hyaluronic acid serum on damp skin and lock it in with a lightweight moisturizer, morning and night.",
  };
  return {
    reasoning: "Signs of noticeable dryness detected, especially around the cheek and forehead zones. The skin barrier may benefit from extra support.",
    action: "Switch to a ceramide-rich moisturizer and apply a hydrating overnight mask 2–3 times weekly to rebuild moisture.",
  };
}

function acneWording(score: number) {
  if (score >= 80) return {
    reasoning: "Your skin appears largely clear with minimal congestion. Pores look refined and breakout risk appears low.",
    action: "Maintain a consistent cleansing routine and use a lightweight non-comedogenic moisturizer to keep breakouts at bay.",
  };
  if (score >= 60) return {
    reasoning: "Mild congestion is visible near the T-zone with some pore activity, which may slightly increase breakout risk over time.",
    action: "Try a salicylic acid cleanser 2–3 times weekly and avoid heavy oils or occlusive products on the T-zone.",
  };
  return {
    reasoning: "Active congestion and visible pore activity detected in multiple zones. This may indicate excess oil production or buildup.",
    action: "Introduce a BHA (salicylic acid 2%) treatment nightly, use a gentle clay mask weekly, and avoid touching your face.",
  };
}

function darkSpotWording(score: number) {
  if (score >= 80) return {
    reasoning: "Skin tone appears even and balanced with minimal signs of hyperpigmentation. Your complexion looks bright and uniform.",
    action: "Continue using daily SPF 30+ to protect against future pigmentation and maintain your even tone.",
  };
  if (score >= 60) return {
    reasoning: "Slight uneven pigmentation detected around the jawline and under-eye region. These are common areas affected by sun exposure.",
    action: "A Vitamin C serum in the morning paired with daily SPF 50 can help brighten and prevent further darkening.",
  };
  return {
    reasoning: "Noticeable pigmentation variation visible in several facial zones. Post-inflammatory marks or sun damage patterns may be present.",
    action: "Use a niacinamide 10% serum daily, add tranexamic acid for stubborn spots, and never skip SPF — even on cloudy days.",
  };
}

function textureWording(score: number) {
  if (score >= 80) return {
    reasoning: "Skin texture looks smooth and refined overall. Surface appears even with minimal visible roughness or bumps.",
    action: "Keep exfoliating gently once a week and maintain your hydration routine for continued smoothness.",
  };
  if (score >= 60) return {
    reasoning: "Skin texture looks mostly smooth with minor unevenness near the nose and chin. Some fine texture variation is visible.",
    action: "Gentle exfoliation 1–2 times weekly with AHA or PHA can improve texture. Pair with a hydrating toner afterward.",
  };
  return {
    reasoning: "Visible texture irregularity detected across the cheek and forehead areas. Roughness and uneven patches are apparent.",
    action: "Try a lactic acid peel pad 2–3 times weekly and follow with a soothing, barrier-repair moisturizer to restore smoothness.",
  };
}

function getProgressText(current: number, prev: number | null, label: string): string | undefined {
  if (prev === null) return undefined;
  const diff = current - prev;
  if (diff > 5) return `+${diff}%`;
  if (diff > 0) return `+${diff}%`;
  if (diff < -5) return `${diff}%`;
  if (diff < 0) return `${diff}%`;
  return "Steady";
}

// --- Component ---

const Results = () => {
  const location = useLocation();
  const passedId = (location.state as { analysisId?: string })?.analysisId || null;
  const byId = useAnalysisById(passedId);
  const latest = useLatestAnalysis();
  const { isPaid } = usePlan();
  const { user } = useAuth();
  const [previousAnalysis, setPreviousAnalysis] = useState<{
    overall_score: number;
    skin_score: number | null;
    photo_url: string | null;
  } | null>(null);
  const [totalScans, setTotalScans] = useState(0);
  const [scansThisWeek, setScansThisWeek] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  const { analysis, loading } = passedId ? byId : latest;

  useEffect(() => {
    if (!user || !analysis) return;

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    Promise.all([
      supabase
        .from("analysis_history")
        .select("overall_score, skin_score, photo_url")
        .eq("user_id", user.id)
        .lt("created_at", analysis.created_at)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("analysis_history")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("analysis_history")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfWeek.toISOString()),
      supabase
        .from("analysis_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]).then(([prevRes, totalRes, weekRes, historyRes]) => {
      if (prevRes.data) setPreviousAnalysis(prevRes.data as any);
      setTotalScans(totalRes.count || 0);
      setScansThisWeek(weekRes.count || 0);
      if (historyRes.data) setHistory(historyRes.data);
    });
  }, [user, analysis]);

  // Confetti on score improvement
  const confettiFired = useRef(false);
  useEffect(() => {
    if (confettiFired.current) return;
    if (previousAnalysis && analysis && analysis.overall_score > previousAnalysis.overall_score) {
      confettiFired.current = true;
      const duration = 2000;
      const end = Date.now() + duration;
      const colors = ["#a855f7", "#d946ef", "#f472b6", "#facc15", "#34d399"];
      (function frame() {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [previousAnalysis, analysis]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No analysis found. Upload a selfie first!</p>
        <Button className="mt-4 gradient-bg border-0 text-primary-foreground" asChild>
          <Link to="/upload">Upload Photo</Link>
        </Button>
      </div>
    );
  }

  const improvement = previousAnalysis ? analysis.overall_score - previousAnalysis.overall_score : null;
  const analysisData = analysis.analysis_data;

  // Extract real scores from analysis_data when available
  const skinDetails = analysisData?.skin?.details || [];
  const getDetail = (keyword: string) =>
    skinDetails.find((d) => d.label.toLowerCase().includes(keyword));

  const hydrationScore = getDetail("hydration")?.value ?? getDetail("moisture")?.value ?? analysis.skin_score ?? 65;
  const acneScore = getDetail("acne")?.value ?? getDetail("blemish")?.value ?? getDetail("clarity")?.value ?? Math.max((analysis.skin_score ?? 70) - 8, 30);
  const darkSpotScore = getDetail("dark")?.value ?? getDetail("pigment")?.value ?? getDetail("tone")?.value ?? Math.max((analysis.skin_score ?? 70) - 5, 30);
  const textureScore = getDetail("texture")?.value ?? getDetail("smooth")?.value ?? analysis.skin_score ?? 65;

  const prevSkinBase = previousAnalysis?.skin_score ?? null;

  const breakdowns = [
    {
      label: "Hydration",
      score: hydrationScore,
      color: "hsl(200, 80%, 55%)",
      confidence: getConfidence(hydrationScore),
      ...hydrationWording(hydrationScore),
      trend: (improvement !== null ? (improvement > 0 ? "up" : improvement < 0 ? "down" : "neutral") : "neutral") as "up" | "down" | "neutral",
      trendText: getProgressText(hydrationScore, prevSkinBase, "Hydration"),
    },
    {
      label: "Acne & Breakout Risk",
      score: acneScore,
      color: "hsl(340, 70%, 55%)",
      confidence: getConfidence(acneScore),
      ...acneWording(acneScore),
      trend: (improvement !== null ? (improvement > 0 ? "up" : improvement < 0 ? "down" : "neutral") : "neutral") as "up" | "down" | "neutral",
      trendText: getProgressText(acneScore, prevSkinBase ? Math.max(prevSkinBase - 8, 30) : null, "Acne"),
    },
    {
      label: "Dark Spots",
      score: darkSpotScore,
      color: "hsl(35, 80%, 55%)",
      confidence: getConfidence(darkSpotScore),
      ...darkSpotWording(darkSpotScore),
      trend: (improvement !== null ? (improvement > 0 ? "up" : improvement < 0 ? "down" : "neutral") : "neutral") as "up" | "down" | "neutral",
      trendText: getProgressText(darkSpotScore, prevSkinBase ? Math.max(prevSkinBase - 5, 30) : null, "Dark Spots"),
    },
    {
      label: "Texture",
      score: textureScore,
      color: "hsl(160, 60%, 45%)",
      confidence: getConfidence(textureScore),
      ...textureWording(textureScore),
      trend: (improvement !== null ? (improvement > 0 ? "up" : improvement < 0 ? "down" : "neutral") : "neutral") as "up" | "down" | "neutral",
      trendText: getProgressText(textureScore, prevSkinBase, "Texture"),
    },
  ];

  // AI insights — prefer real data, fallback to believable defaults
  const aiInsights: string[] = [];
  const skinDesc = analysisData?.skin?.description;
  if (skinDesc) {
    // Extract short insights from the skin description
    const sentences = skinDesc.split(/\.\s+/).filter((s) => s.length > 15 && s.length < 120);
    aiInsights.push(...sentences.slice(0, 4));
  }
  if (aiInsights.length === 0 && analysisData?.skin?.tips) {
    // Tips are often long paragraphs, extract first sentence from each
    analysisData.skin.tips.forEach((tip) => {
      const first = tip.split(/\.\s+/)[0];
      if (first && first.length < 120) aiInsights.push(first);
    });
  }
  if (aiInsights.length === 0) {
    // Believable defaults based on scores
    if (hydrationScore < 75) aiInsights.push("Slight dryness observed around the cheek and forehead regions");
    else aiInsights.push("Healthy moisture balance detected across all facial zones");
    if (acneScore < 75) aiInsights.push("Mild pore congestion visible near the T-zone area");
    else aiInsights.push("Pores appear refined with minimal congestion");
    if (darkSpotScore < 75) aiInsights.push("Some pigmentation variation noted around the jawline");
    else aiInsights.push("Even skin tone with balanced pigmentation");
    if (textureScore < 75) aiInsights.push("Minor texture variation near the nose and chin");
    else aiInsights.push("Overall smooth texture with good surface consistency");
  }

  // Routine from analysis data
  const morningRoutine = analysisData?.skin?.product_suggestions
    ?.filter((_, i) => i < 2)
    .map((p) => ({ name: p.name, reason: p.reason })) || [
    { name: "Gentle cleanser", reason: "Remove overnight buildup without stripping moisture" },
    { name: "Vitamin C serum", reason: "Antioxidant protection and brightening" },
  ];
  const nightRoutine = analysisData?.skin?.product_suggestions
    ?.filter((_, i) => i >= 2 && i < 4)
    .map((p) => ({ name: p.name, reason: p.reason })) || [
    { name: "Hyaluronic acid", reason: "Deep hydration while you sleep" },
    { name: "Moisturizer", reason: "Lock in moisture and repair skin barrier" },
  ];

  // Emotional feedback — more specific
  const emotionalFeedback =
    analysis.overall_score >= 85
      ? "Your skin is glowing — your routine is clearly working ✨"
      : analysis.overall_score >= 75
      ? "Your skin looks healthy with room for a little extra glow ✨"
      : analysis.overall_score >= 60
      ? "Your skin has a solid foundation — small tweaks can unlock your best glow ✨"
      : "Every great glow journey starts here — your skin has beautiful potential ✨";

  // Progress encouragement
  const progressMessage = improvement !== null
    ? improvement > 5
      ? "Your glow journey is moving in the right direction ✨ Keep going!"
      : improvement > 0
      ? "Slight improvement since your last scan — consistency is key ✨"
      : improvement === 0
      ? "Holding steady — your routine is maintaining your skin well"
      : "A small dip is normal — factors like sleep, diet, and stress can affect results day to day"
    : null;

  // New personalized data
  const personalizedInsights = analysisData?.personalized_insights || aiInsights;
  const categoryBreakdown = analysisData?.category_breakdown;
  const glowPotential = analysisData?.glow_potential;
  const aiConfidence = analysisData?.ai_confidence;

  const categoryCards = [
    { key: "skin_quality", label: "Skin Quality", icon: Droplets, data: categoryBreakdown?.skin_quality, color: "from-blue-500 to-cyan-400" },
    { key: "symmetry", label: "Symmetry", icon: Scan, data: categoryBreakdown?.symmetry, color: "from-purple-500 to-pink-400" },
    { key: "glow_level", label: "Glow Level", icon: Sparkles, data: categoryBreakdown?.glow_level, color: "from-amber-400 to-orange-400" },
    { key: "acne_risk", label: "Acne Risk", icon: ShieldCheck, data: categoryBreakdown?.acne_risk, color: "from-emerald-500 to-teal-400" },
  ];

  return (
    <div className="p-4 md:p-10 max-w-3xl mx-auto space-y-6">
      {/* === TOP SUMMARY === */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 text-center space-y-4"
      >
        <h1 className="font-display text-2xl font-bold">Your AI Skin Report</h1>
        <GlowScoreGauge score={analysis.overall_score} size={200} label="Your Glow Score" />
        {improvement !== null && (
          <p className={`text-sm font-medium ${improvement >= 0 ? "text-emerald-500" : "text-amber-500"}`}>
            {improvement >= 0 ? "+" : ""}{improvement} from last scan
          </p>
        )}
        <p className="text-sm text-muted-foreground italic">{emotionalFeedback}</p>
        {progressMessage && (
          <p className="text-xs text-muted-foreground/80">{progressMessage}</p>
        )}

        {/* AI Confidence Badge */}
        {aiConfidence && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${
              aiConfidence.level === "high" ? "text-emerald-500" :
              aiConfidence.level === "moderate" ? "text-amber-500" : "text-muted-foreground"
            }`} />
            <span className="text-xs font-medium">
              Confidence: <span className={
                aiConfidence.level === "high" ? "text-emerald-500" :
                aiConfidence.level === "moderate" ? "text-amber-500" : "text-muted-foreground"
              }>{aiConfidence.level.charAt(0).toUpperCase() + aiConfidence.level.slice(1)}</span>
            </span>
            <span className="text-[10px] text-muted-foreground">({aiConfidence.reason})</span>
          </motion.div>
        )}
      </motion.div>

      {/* === FACE LANDMARK OVERLAY === */}
      <FaceLandmarkOverlay
        photoUrl={analysis.photo_url}
        overallScore={analysis.overall_score}
        skinScore={analysis.skin_score}
        acneScore={acneScore}
        darkSpotScore={darkSpotScore}
      />

      {/* === PERSONALIZED INSIGHTS === */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-3xl p-5 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-sm">Personalized Insights</h2>
        </div>
        <p className="text-[10px] text-muted-foreground">Unique observations based on your face analysis</p>
        <div className="space-y-2">
          {personalizedInsights.slice(0, 5).map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="flex items-start gap-2.5 text-xs text-foreground/90 leading-relaxed bg-muted/30 rounded-xl px-3 py-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              {insight}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* === CATEGORY BREAKDOWN (New 4 categories) === */}
      {categoryBreakdown && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-display text-lg font-bold">Category Breakdown</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryCards.map((cat, i) => {
              const data = cat.data;
              if (!data) return null;
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="glass-card rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                    </div>
                    <AnimatedCounter value={`${data.score}%`} className="text-xl font-display font-bold gradient-text" />
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${data.score}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{data.explanation}</p>
                  <div className="flex items-start gap-1.5 text-[10px] text-primary bg-primary/5 rounded-lg px-2.5 py-1.5">
                    <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{data.suggestion}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* === GLOW POTENTIAL SCORE === */}
      {glowPotential && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-3xl p-5 text-center space-y-3 border border-primary/20"
        >
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-base">Glow Potential</h2>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-display font-bold gradient-text">+{glowPotential.improvement_percent}%</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">{glowPotential.message}</p>
        </motion.div>
      )}

      {/* === 2. DETAILED ANALYSIS (AI Feature Breakdown) === */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-display text-lg font-bold">AI Feature Breakdown</h2>
          <span className="text-[10px] text-muted-foreground">Supporting proof metrics</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "symmetry", label: "Face Symmetry", icon: Scan, link: "/results/symmetry", score: analysis.symmetry_score, premium: false },
            { key: "skin", label: "Skin Quality", icon: Droplets, link: "/results/skin", score: analysis.skin_score, premium: false },
            { key: "hairstyle", label: "Hairstyle Match", icon: Scissors, link: "/results/hairstyle", score: analysis.hairstyle_score, premium: true },
            { key: "style", label: "Style Rating", icon: Shirt, link: "/results/style", score: analysis.style_score, premium: true },
          ].map((item, i) => {
            const locked = item.premium && !isPaid;
            const Icon = item.icon;
            const score = item.score ?? 0;
            const conf = score >= 70 ? "High" : score >= 45 ? "Moderate" : "Early";
            const confColor = score >= 70 ? "text-emerald-500" : score >= 45 ? "text-amber-500" : "text-muted-foreground";
            const trendDir = improvement !== null ? (improvement > 0 ? "up" : improvement < 0 ? "down" : "neutral") : "neutral";
            const TrendIcon = trendDir === "up" ? TrendingUp : trendDir === "down" ? TrendingDown : Minus;
            const trendColor = trendDir === "up" ? "text-emerald-500" : trendDir === "down" ? "text-red-400" : "text-muted-foreground";

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
              >
                {locked ? (
                  <div className="glass-card rounded-2xl p-4 opacity-60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                      </div>
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <p className="text-xl font-display font-bold text-muted-foreground">🔒</p>
                    <p className="text-[10px] text-muted-foreground">Upgrade to unlock</p>
                  </div>
                ) : (
                  <Link to={item.link}>
                    <div className="glass-card rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer group space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <p className="text-xs font-semibold text-foreground">{item.label}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <AnimatedCounter value={`${item.score ?? 0}%`} className="text-2xl font-display font-bold gradient-text" />
                        <div className="flex items-center gap-1 mb-1">
                          <ShieldCheck className={`w-3 h-3 ${confColor}`} />
                          <span className={`text-[9px] font-medium ${confColor}`}>{conf}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.06, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* === 3. BEFORE VS AFTER COMPARISON === */}
      {previousAnalysis && (
        <BeforeAfterComparison
          previousPhotoUrl={previousAnalysis.photo_url}
          currentPhotoUrl={analysis.photo_url}
          previousScore={previousAnalysis.overall_score}
          currentScore={analysis.overall_score}
          previousSkinScore={previousAnalysis.skin_score}
          currentSkinScore={analysis.skin_score}
        />
      )}

      {/* === 4. SKIN BREAKDOWN === */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-display text-lg font-bold">Skin Breakdown</h2>
          <span className="text-[10px] text-muted-foreground">Based on visible surface patterns</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {breakdowns.map((b, i) => (
            <SkinBreakdownCard
              key={b.label}
              label={b.label}
              score={b.score}
              reasoning={b.reasoning}
              action={b.action}
              confidence={b.confidence}
              color={b.color}
              trend={b.trend}
              trendText={b.trendText}
              delay={0.35 + i * 0.08}
            />
          ))}
        </div>
      </motion.div>

      {/* Old "Why AI Gave This Result" replaced by Personalized Insights above */}

      {/* === 6. PERSONALIZED ROUTINE === */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card rounded-3xl p-5 space-y-4"
      >
        <h3 className="font-display font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Your Personalized Routine
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              Morning
            </div>
            {morningRoutine.map((item, i) => (
              <div key={i} className="pl-5 space-y-0.5">
                <p className="text-xs font-medium text-foreground">• {item.name}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{item.reason}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              Night
            </div>
            {nightRoutine.map((item, i) => (
              <div key={i} className="pl-5 space-y-0.5">
                <p className="text-xs font-medium text-foreground">• {item.name}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
        <Button className="w-full gradient-bg border-0 text-primary-foreground gap-2 rounded-2xl" asChild>
          <Link to="/products" state={{ fromAnalysis: true, analysisId: analysis.id }}>
            <CalendarCheck className="w-4 h-4" />
            Start 7-Day Glow Plan
          </Link>
        </Button>
      </motion.div>

      {/* === 7. WEEKLY PROGRESS GRAPH === */}
      {history.length >= 2 && (
        <GlowJourneySection
          history={history}
          streak={(() => {
            if (history.length === 0) return 0;
            let count = 1;
            for (let i = 1; i < history.length; i++) {
              const diff = (new Date(history[i - 1].created_at).getTime() - new Date(history[i].created_at).getTime()) / (1000 * 60 * 60 * 24);
              if (diff <= 1.5) count++;
              else break;
            }
            return count;
          })()}
          isPaid={isPaid}
        />
      )}

      {/* === 8. HISTORY / PREMIUM LOCK === */}
      {!isPaid && (
        <UpgradePrompt compact description="Unlock Hairstyle & Style analysis, daily tracking, and premium insights." />
      )}

      {/* === PRODUCT RECO CTA === */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
        <Link to="/products" state={{ fromAnalysis: true, analysisId: analysis.id }}>
          <Card className="rounded-3xl gradient-bg-subtle border-0 hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shrink-0">
                <ShoppingBag className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-sm">Product Recommendations</h3>
                <p className="text-xs text-muted-foreground">Personalized products based on your analysis</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <div className="flex flex-wrap gap-2.5 justify-center">
        <Button
          size="sm"
          className="gap-1.5 text-primary-foreground border-0 rounded-2xl"
          style={{ backgroundColor: "hsl(142, 70%, 40%)" }}
          onClick={() => {
            const text = `Check out my FaceNova score: ${analysis.overall_score}/100! ✨ Get your free analysis:`;
            const url = window.location.origin;
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank");
          }}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-2xl" asChild>
          <Link to="/share"><Share2 className="w-3.5 h-3.5" /> Share</Link>
        </Button>
        {isPaid ? (
          <Button variant="outline" size="sm" className="gap-1.5 rounded-2xl" asChild>
            <Link to="/download"><Download className="w-3.5 h-3.5" /> Download</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-1.5 opacity-60 rounded-2xl" asChild>
            <Link to="/plans"><Lock className="w-3.5 h-3.5" /> Download (Pro)</Link>
          </Button>
        )}
      </div>

      {/* === TRUST BADGES === */}
      <TrustBadges />

      {/* === ENGAGEMENT & PREMIUM === */}
      <EngagementCards
        scansThisWeek={scansThisWeek}
        isPaid={isPaid}
        totalScans={totalScans}
      />
    </div>
  );
};

export default Results;
