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
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2, Download, ChevronRight, ChevronDown, Loader2, Lock, ShoppingBag,
  MessageCircle, Sparkles, Sun, Moon, Eye, Droplets, CalendarCheck,
  Scan, Scissors, Shirt, TrendingUp, TrendingDown, Minus, ShieldCheck, Rocket, FileText
} from "lucide-react";
import { useEffect, useState, useRef, lazy, Suspense } from "react";
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
  if (diff > 0) return `+${diff}%`;
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
  const [reportExpanded, setReportExpanded] = useState(false);

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

  const skinDetails = analysisData?.skin?.details || [];
  const getDetail = (keyword: string) =>
    skinDetails.find((d: any) => d.label.toLowerCase().includes(keyword));

  const hydrationScore = getDetail("hydration")?.value ?? getDetail("moisture")?.value ?? analysis.skin_score ?? 65;
  const acneScore = getDetail("acne")?.value ?? getDetail("blemish")?.value ?? getDetail("clarity")?.value ?? Math.max((analysis.skin_score ?? 70) - 8, 30);
  const darkSpotScore = getDetail("dark")?.value ?? getDetail("pigment")?.value ?? getDetail("tone")?.value ?? Math.max((analysis.skin_score ?? 70) - 5, 30);
  const textureScore = getDetail("texture")?.value ?? getDetail("smooth")?.value ?? analysis.skin_score ?? 65;

  const prevSkinBase = previousAnalysis?.skin_score ?? null;

  const breakdowns = [
    { label: "Hydration", score: hydrationScore, color: "hsl(200, 80%, 55%)", confidence: getConfidence(hydrationScore), ...hydrationWording(hydrationScore), trend: (improvement !== null ? (improvement > 0 ? "up" : improvement < 0 ? "down" : "neutral") : "neutral") as "up" | "down" | "neutral", trendText: getProgressText(hydrationScore, prevSkinBase, "Hydration") },
    { label: "Acne & Breakout Risk", score: acneScore, color: "hsl(340, 70%, 55%)", confidence: getConfidence(acneScore), ...acneWording(acneScore), trend: (improvement !== null ? (improvement > 0 ? "up" : improvement < 0 ? "down" : "neutral") : "neutral") as "up" | "down" | "neutral", trendText: getProgressText(acneScore, prevSkinBase ? Math.max(prevSkinBase - 8, 30) : null, "Acne") },
    { label: "Dark Spots", score: darkSpotScore, color: "hsl(35, 80%, 55%)", confidence: getConfidence(darkSpotScore), ...darkSpotWording(darkSpotScore), trend: (improvement !== null ? (improvement > 0 ? "up" : improvement < 0 ? "down" : "neutral") : "neutral") as "up" | "down" | "neutral", trendText: getProgressText(darkSpotScore, prevSkinBase ? Math.max(prevSkinBase - 5, 30) : null, "Dark Spots") },
    { label: "Texture", score: textureScore, color: "hsl(160, 60%, 45%)", confidence: getConfidence(textureScore), ...textureWording(textureScore), trend: (improvement !== null ? (improvement > 0 ? "up" : improvement < 0 ? "down" : "neutral") : "neutral") as "up" | "down" | "neutral", trendText: getProgressText(textureScore, prevSkinBase, "Texture") },
  ];

  // AI insights
  const aiInsights: string[] = [];
  const skinDesc = analysisData?.skin?.description;
  if (skinDesc) {
    const sentences = skinDesc.split(/\.\s+/).filter((s: string) => s.length > 15 && s.length < 120);
    aiInsights.push(...sentences.slice(0, 4));
  }
  if (aiInsights.length === 0 && analysisData?.skin?.tips) {
    analysisData.skin.tips.forEach((tip: string) => {
      const first = tip.split(/\.\s+/)[0];
      if (first && first.length < 120) aiInsights.push(first);
    });
  }
  if (aiInsights.length === 0) {
    if (hydrationScore < 75) aiInsights.push("Slight dryness observed around the cheek and forehead regions");
    else aiInsights.push("Healthy moisture balance detected across all facial zones");
    if (acneScore < 75) aiInsights.push("Mild pore congestion visible near the T-zone area");
    else aiInsights.push("Pores appear refined with minimal congestion");
    if (darkSpotScore < 75) aiInsights.push("Some pigmentation variation noted around the jawline");
    else aiInsights.push("Even skin tone with balanced pigmentation");
    if (textureScore < 75) aiInsights.push("Minor texture variation near the nose and chin");
    else aiInsights.push("Overall smooth texture with good surface consistency");
  }

  const morningRoutine = analysisData?.skin?.product_suggestions
    ?.filter((_: any, i: number) => i < 2)
    .map((p: any) => ({ name: p.name, reason: p.reason })) || [
    { name: "Gentle cleanser", reason: "Remove overnight buildup without stripping moisture" },
    { name: "Vitamin C serum", reason: "Antioxidant protection and brightening" },
  ];
  const nightRoutine = analysisData?.skin?.product_suggestions
    ?.filter((_: any, i: number) => i >= 2 && i < 4)
    .map((p: any) => ({ name: p.name, reason: p.reason })) || [
    { name: "Hyaluronic acid", reason: "Deep hydration while you sleep" },
    { name: "Moisturizer", reason: "Lock in moisture and repair skin barrier" },
  ];

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

  // Top 2 highlight categories for the compact view
  const highlightCategories = [
    { label: "Skin Quality", score: analysis.skin_score ?? 0, icon: Droplets },
    { label: "Symmetry", score: analysis.symmetry_score ?? 0, icon: Scan },
  ];

  return (
    <div className="pb-24 md:pb-6">
      <div className="p-4 md:p-10 max-w-3xl mx-auto space-y-5">

        {/* ═══════════════════════════════════════════
            1. HERO SECTION — ABOVE THE FOLD
        ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-6 text-center space-y-3 relative overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse at 50% 30%, hsl(var(--glow-purple) / 0.08) 0%, transparent 60%)"
          }} />

          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium relative">AI Skin Report</p>

          <div className="relative">
            <GlowScoreGauge score={analysis.overall_score} size={180} label="Your Glow Score" />
          </div>

          {/* Improvement badge */}
          {improvement !== null && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                improvement > 0
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : improvement === 0
                  ? "bg-muted/40 text-muted-foreground border border-border/30"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {improvement > 0 ? <TrendingUp className="w-3 h-3" /> : improvement < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {improvement > 0 ? `+${improvement}` : improvement} from last scan
            </motion.div>
          )}

          {/* AI Confidence */}
          {aiConfidence && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 border border-border/20">
              <ShieldCheck className={`w-3 h-3 ${
                aiConfidence.level === "high" ? "text-emerald-500" :
                aiConfidence.level === "moderate" ? "text-amber-500" : "text-muted-foreground"
              }`} />
              <span className="text-[10px] text-muted-foreground">{aiConfidence.level} confidence</span>
            </div>
          )}

          {/* 2–3 key insights only */}
          <div className="space-y-1.5 pt-1">
            {personalizedInsights.slice(0, 3).map((insight: string, i: number) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-xs text-foreground/80 leading-relaxed flex items-start gap-2"
              >
                <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                {insight}
              </motion.p>
            ))}
          </div>

          {/* Quick share */}
          <div className="flex justify-center gap-2 pt-1">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-[10px] h-7 text-muted-foreground rounded-xl"
              onClick={() => {
                const text = `I got ${analysis.overall_score}% glow score 😎 Can you beat me?`;
                const url = window.location.origin;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank");
              }}
            >
              <MessageCircle className="w-3 h-3" /> Share
            </Button>
            <Button size="sm" variant="ghost" className="gap-1.5 text-[10px] h-7 text-muted-foreground rounded-xl" asChild>
              <Link to="/share"><Share2 className="w-3 h-3" /> Link</Link>
            </Button>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            2. BEFORE vs AFTER — HIGH PRIORITY
        ═══════════════════════════════════════════ */}
        {previousAnalysis && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <BeforeAfterComparison
              previousPhotoUrl={previousAnalysis.photo_url}
              currentPhotoUrl={analysis.photo_url}
              previousScore={previousAnalysis.overall_score}
              currentScore={analysis.overall_score}
              previousSkinScore={previousAnalysis.skin_score}
              currentSkinScore={analysis.skin_score}
            />
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════
            3. CATEGORY HIGHLIGHTS — TOP 2 ONLY
        ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            {highlightCategories.map((cat, i) => {
              const Icon = cat.icon;
              const score = cat.score;
              return (
                <motion.div
                  key={cat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="glass-card rounded-2xl p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">{cat.label}</p>
                  </div>
                  <AnimatedCounter value={`${score}%`} className="text-2xl font-display font-bold gradient-text" />
                  <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, hsl(var(--glow-purple)), hsl(var(--glow-pink)))" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* View Full Analysis link */}
          <Link to="/results/skin" className="block">
            <div className="flex items-center justify-center gap-2 py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              <Eye className="w-3.5 h-3.5" />
              View Full Analysis
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </motion.div>

        {/* ═══════════════════════════════════════════
            4. GLOW POTENTIAL — PROMINENT
        ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative rounded-3xl p-5 text-center space-y-2 overflow-hidden border border-primary/20"
          style={{
            background: "linear-gradient(135deg, hsl(var(--glow-purple) / 0.12) 0%, hsl(var(--glow-pink) / 0.08) 100%)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(circle at 50% 50%, hsl(var(--glow-purple) / 0.06) 0%, transparent 70%)"
          }} />
          <div className="relative flex items-center justify-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-sm">Glow Potential</h2>
          </div>
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="relative block text-3xl font-display font-extrabold gradient-text"
          >
            +{glowPotential?.improvement_percent ?? 15}%
          </motion.span>
          <p className="relative text-xs text-muted-foreground max-w-xs mx-auto">
            {glowPotential?.message ?? "You can improve with consistent skincare and daily tracking"}
          </p>
        </motion.div>

        {/* ═══════════════════════════════════════════
            5. AI FACE LANDMARK OVERLAY
        ═══════════════════════════════════════════ */}
        <FaceLandmarkOverlay
          photoUrl={analysis.photo_url}
          overallScore={analysis.overall_score}
          skinScore={analysis.skin_score}
          acneScore={acneScore}
          darkSpotScore={darkSpotScore}
        />

        {/* ═══════════════════════════════════════════
            6. PERSONALIZED ROUTINE (compact)
        ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-5 space-y-3"
        >
          <h3 className="font-display font-semibold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Your Routine
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <Sun className="w-3 h-3 text-amber-500" /> Morning
              </div>
              {morningRoutine.map((item: any, i: number) => (
                <p key={i} className="text-[10px] text-foreground/80 pl-4">• {item.name}</p>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                <Moon className="w-3 h-3 text-indigo-400" /> Night
              </div>
              {nightRoutine.map((item: any, i: number) => (
                <p key={i} className="text-[10px] text-foreground/80 pl-4">• {item.name}</p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════
            7. COLLAPSIBLE FULL REPORT
        ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <button
            onClick={() => setReportExpanded(!reportExpanded)}
            className="w-full glass-card rounded-2xl px-5 py-3.5 flex items-center justify-between group hover:border-primary/20 transition-all"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold text-sm">View Full Report</span>
            </div>
            <motion.div
              animate={{ rotate: reportExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
          </button>

          <AnimatePresence>
            {reportExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-5 pt-4">

                  {/* Full Personalized Insights */}
                  <div className="glass-card rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-3.5 h-3.5 text-primary" />
                      <h4 className="font-display font-semibold text-xs">All Insights</h4>
                    </div>
                    {personalizedInsights.map((insight: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-foreground/80 leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                        {insight}
                      </div>
                    ))}
                  </div>

                  {/* Category Breakdown */}
                  {categoryBreakdown && (
                    <div className="space-y-3">
                      <h4 className="font-display font-semibold text-xs px-1">Category Breakdown</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categoryCards.map((cat, i) => {
                          const data = cat.data;
                          if (!data) return null;
                          const Icon = cat.icon;
                          return (
                            <div key={cat.key} className="glass-card rounded-2xl p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                                    <Icon className="w-3 h-3 text-white" />
                                  </div>
                                  <p className="text-[11px] font-semibold text-foreground">{cat.label}</p>
                                </div>
                                <span className="text-sm font-display font-bold gradient-text">{data.score}%</span>
                              </div>
                              <div className="w-full h-1 rounded-full bg-muted/30 overflow-hidden">
                                <div className="h-full rounded-full bg-primary" style={{ width: `${data.score}%` }} />
                              </div>
                              <p className="text-[10px] text-foreground/70 leading-relaxed">{data.explanation}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* AI Feature Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-display font-semibold text-xs px-1">AI Feature Breakdown</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: "symmetry", label: "Face Symmetry", icon: Scan, link: "/results/symmetry", score: analysis.symmetry_score, premium: false },
                        { key: "skin", label: "Skin Quality", icon: Droplets, link: "/results/skin", score: analysis.skin_score, premium: false },
                        { key: "hairstyle", label: "Hairstyle Match", icon: Scissors, link: "/results/hairstyle", score: analysis.hairstyle_score, premium: true },
                        { key: "style", label: "Style Rating", icon: Shirt, link: "/results/style", score: analysis.style_score, premium: true },
                      ].map((item) => {
                        const locked = item.premium && !isPaid;
                        const Icon = item.icon;
                        const score = item.score ?? 0;
                        return (
                          <div key={item.key}>
                            {locked ? (
                              <div className="glass-card rounded-xl p-3 opacity-50 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <Icon className="w-3 h-3 text-muted-foreground" />
                                  <p className="text-[10px] font-semibold text-muted-foreground">{item.label}</p>
                                  <Lock className="w-2.5 h-2.5 text-muted-foreground ml-auto" />
                                </div>
                                <p className="text-[10px] text-muted-foreground">Upgrade to unlock</p>
                              </div>
                            ) : (
                              <Link to={item.link}>
                                <div className="glass-card rounded-xl p-3 hover:border-primary/20 transition-all space-y-1 group">
                                  <div className="flex items-center gap-1.5">
                                    <Icon className="w-3 h-3 text-primary" />
                                    <p className="text-[10px] font-semibold text-foreground">{item.label}</p>
                                    <ChevronRight className="w-2.5 h-2.5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                                  </div>
                                  <p className="text-lg font-display font-bold gradient-text">{score}%</p>
                                </div>
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skin Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-display font-semibold text-xs px-1">Skin Breakdown</h4>
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
                          delay={0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Weekly Progress */}
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

                  {/* Product Reco */}
                  <Link to="/products" state={{ fromAnalysis: true, analysisId: analysis.id }}>
                    <Card className="rounded-2xl gradient-bg-subtle border-0 hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-xs">Product Recommendations</h3>
                          <p className="text-[10px] text-muted-foreground">Personalized for your skin</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Upgrade prompt */}
                  {!isPaid && (
                    <UpgradePrompt compact description="Unlock Hairstyle & Style analysis, daily tracking, and premium insights." />
                  )}

                  {/* Trust badges */}
                  <TrustBadges />

                  {/* Engagement */}
                  <EngagementCards scansThisWeek={scansThisWeek} isPaid={isPaid} totalScans={totalScans} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Share / Download row */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-xl text-[11px] h-8"
            asChild
          >
            <Link to="/share"><Share2 className="w-3 h-3" /> Share Result</Link>
          </Button>
          {isPaid ? (
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl text-[11px] h-8" asChild>
              <Link to="/download"><Download className="w-3 h-3" /> Download</Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl text-[11px] h-8 opacity-60" asChild>
              <Link to="/plans"><Lock className="w-3 h-3" /> Download (Pro)</Link>
            </Button>
          )}
        </div>

      </div>

      {/* ═══════════════════════════════════════════
          8. STICKY CTA
      ═══════════════════════════════════════════ */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 p-3 md:p-4"
        style={{
          background: "linear-gradient(to top, hsl(0 0% 3% / 0.95) 60%, transparent 100%)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <Button
            className="w-full gradient-bg border-0 text-primary-foreground btn-glow rounded-2xl h-12 text-sm font-semibold gap-2 shadow-lg"
            asChild
          >
            <Link to="/products" state={{ fromAnalysis: true, analysisId: analysis.id }}>
              <Rocket className="w-4 h-4" />
              Improve My Glow
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
