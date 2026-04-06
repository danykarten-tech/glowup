import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Sparkles, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import SignedImage from "@/components/SignedImage";

interface FaceAnalysisOverlayProps {
  photoUrl: string | null | undefined;
  overallScore: number;
  skinScore: number | null;
  acneScore: number;
  darkSpotScore: number;
}

// Facial landmark groups (relative % positions)
const landmarkGroups = {
  eyes: [
    { x: 33, y: 36, label: "Left eye" },
    { x: 67, y: 36, label: "Right eye" },
    { x: 28, y: 33, label: "Left brow" },
    { x: 72, y: 33, label: "Right brow" },
  ],
  nose: [
    { x: 50, y: 45, label: "Bridge" },
    { x: 50, y: 54, label: "Tip" },
    { x: 45, y: 52, label: "Left nostril" },
    { x: 55, y: 52, label: "Right nostril" },
  ],
  jawline: [
    { x: 22, y: 55, label: "Left jaw" },
    { x: 28, y: 68, label: "Left chin" },
    { x: 50, y: 76, label: "Chin" },
    { x: 72, y: 68, label: "Right chin" },
    { x: 78, y: 55, label: "Right jaw" },
  ],
  mouth: [
    { x: 42, y: 63, label: "Left lip" },
    { x: 50, y: 61, label: "Upper lip" },
    { x: 58, y: 63, label: "Right lip" },
    { x: 50, y: 67, label: "Lower lip" },
  ],
};

// Skin issue zones (position, size, intensity based on scores)
function getIssueZones(acneScore: number, darkSpotScore: number, skinScore: number | null) {
  const zones: { x: number; y: number; w: number; h: number; type: "acne" | "dark_circles" | "oil"; label: string; intensity: number }[] = [];

  // Acne spots — lower score = more spots
  if (acneScore < 80) {
    zones.push({ x: 42, y: 42, w: 16, h: 10, type: "acne", label: "Acne zone", intensity: Math.max(0.3, (80 - acneScore) / 60) });
  }
  if (acneScore < 65) {
    zones.push({ x: 30, y: 50, w: 12, h: 8, type: "acne", label: "Breakout area", intensity: Math.max(0.2, (65 - acneScore) / 50) });
    zones.push({ x: 60, y: 48, w: 10, h: 8, type: "acne", label: "Congestion", intensity: 0.25 });
  }

  // Dark circles — always show under eyes
  const darkIntensity = Math.max(0.2, (80 - darkSpotScore) / 60);
  zones.push({ x: 28, y: 39, w: 14, h: 6, type: "dark_circles", label: "Dark circles", intensity: darkIntensity });
  zones.push({ x: 58, y: 39, w: 14, h: 6, type: "dark_circles", label: "Dark circles", intensity: darkIntensity });

  // Oil zones (T-zone)
  const oilIntensity = (skinScore !== null && skinScore < 70) ? 0.35 : 0.15;
  zones.push({ x: 40, y: 26, w: 20, h: 16, type: "oil", label: "Oil zone (forehead)", intensity: oilIntensity });
  zones.push({ x: 44, y: 44, w: 12, h: 14, type: "oil", label: "Oil zone (nose)", intensity: oilIntensity * 0.8 });

  return zones;
}

const zoneColors = {
  acne: { bg: "rgba(239, 68, 68, VAR)", border: "rgba(239, 68, 68, 0.6)" },
  dark_circles: { bg: "rgba(168, 85, 247, VAR)", border: "rgba(168, 85, 247, 0.5)" },
  oil: { bg: "rgba(250, 204, 21, VAR)", border: "rgba(250, 204, 21, 0.4)" },
};

const zoneIcons = {
  acne: "🔴",
  dark_circles: "🟣",
  oil: "🟡",
};

const FaceAnalysisOverlay = ({
  photoUrl,
  overallScore,
  skinScore,
  acneScore,
  darkSpotScore,
}: FaceAnalysisOverlayProps) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showIssues, setShowIssues] = useState(true);
  const [showGlow, setShowGlow] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const issueZones = getIssueZones(acneScore, darkSpotScore, skinScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="glass-card rounded-3xl p-5 space-y-4 overflow-hidden"
    >
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm">AI Face Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {showOverlay ? "View AI Analysis" : "Photo Only"}
          </span>
          <Switch checked={showOverlay} onCheckedChange={setShowOverlay} />
        </div>
      </div>

      {/* Image container with overlays */}
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-muted border border-border/30">
        {/* Base photo */}
        {photoUrl ? (
          <div className="relative w-full h-full">
            <SignedImage
              storagePath={photoUrl}
              alt="Your face scan"
              className={`w-full h-full object-cover transition-all duration-700 ${
                showGlow ? "brightness-110 contrast-105 saturate-110" : ""
              }`}
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
              }
            />
            {/* Glow enhancement overlay */}
            <AnimatePresence>
              {showGlow && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at 50% 45%, rgba(168, 85, 247, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 50% 50%, rgba(217, 70, 239, 0.06) 0%, transparent 50%)",
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/50">
            <p className="text-xs text-muted-foreground">No photo available</p>
          </div>
        )}

        {/* Overlay layer */}
        <AnimatePresence>
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Semi-transparent analysis tint */}
              <div className="absolute inset-0 bg-background/10 backdrop-blur-[0.5px]" />

              {/* Facial landmarks */}
              {showLandmarks && Object.entries(landmarkGroups).map(([group, points]) =>
                points.map((pt, i) => (
                  <motion.div
                    key={`${group}-${i}`}
                    className="absolute pointer-events-auto cursor-pointer"
                    style={{ left: `${pt.x}%`, top: `${pt.y}%`, transform: "translate(-50%, -50%)" }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.04, type: "spring", stiffness: 300 }}
                    onHoverStart={() => setActiveTooltip(pt.label)}
                    onHoverEnd={() => setActiveTooltip(null)}
                    onTap={() => setActiveTooltip(activeTooltip === pt.label ? null : pt.label)}
                  >
                    <div className="relative">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: group === "eyes" ? "hsl(var(--glow-purple))" :
                            group === "nose" ? "hsl(var(--glow-pink))" :
                            group === "jawline" ? "hsl(200, 80%, 55%)" :
                            "hsl(160, 60%, 50%)",
                          boxShadow: `0 0 6px ${
                            group === "eyes" ? "hsl(var(--glow-purple) / 0.7)" :
                            group === "nose" ? "hsl(var(--glow-pink) / 0.7)" :
                            group === "jawline" ? "hsla(200, 80%, 55%, 0.7)" :
                            "hsla(160, 60%, 50%, 0.7)"
                          }`,
                        }}
                      />
                      {/* Pulse ring */}
                      <motion.div
                        className="absolute inset-0 rounded-full border"
                        style={{
                          borderColor: group === "eyes" ? "hsl(var(--glow-purple) / 0.4)" :
                            group === "nose" ? "hsl(var(--glow-pink) / 0.4)" :
                            group === "jawline" ? "hsla(200, 80%, 55%, 0.4)" :
                            "hsla(160, 60%, 50%, 0.4)",
                        }}
                        animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                      />
                      {/* Tooltip */}
                      <AnimatePresence>
                        {activeTooltip === pt.label && (
                          <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.9 }}
                            className="absolute left-1/2 -translate-x-1/2 -top-7 whitespace-nowrap bg-background/90 backdrop-blur-md border border-border rounded-lg px-2 py-0.5 text-[9px] font-medium text-foreground shadow-lg z-20"
                          >
                            {pt.label}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Jawline connecting lines */}
              {showLandmarks && (
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="jawGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsla(200, 80%, 55%, 0.3)" />
                      <stop offset="50%" stopColor="hsla(200, 80%, 55%, 0.5)" />
                      <stop offset="100%" stopColor="hsla(200, 80%, 55%, 0.3)" />
                    </linearGradient>
                  </defs>
                  <motion.polyline
                    points={landmarkGroups.jawline.map(p => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke="url(#jawGrad)"
                    strokeWidth="0.3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                  {/* Eye connection */}
                  <motion.line
                    x1={landmarkGroups.eyes[0].x} y1={landmarkGroups.eyes[0].y}
                    x2={landmarkGroups.eyes[1].x} y2={landmarkGroups.eyes[1].y}
                    stroke="hsl(var(--glow-purple) / 0.25)"
                    strokeWidth="0.2"
                    strokeDasharray="1,1"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </svg>
              )}

              {/* Issue zones */}
              {showIssues && issueZones.map((zone, i) => {
                const colors = zoneColors[zone.type];
                return (
                  <motion.div
                    key={`zone-${i}`}
                    className="absolute rounded-full pointer-events-auto cursor-pointer"
                    style={{
                      left: `${zone.x}%`,
                      top: `${zone.y}%`,
                      width: `${zone.w}%`,
                      height: `${zone.h}%`,
                      transform: "translate(-50%, -50%)",
                      background: colors.bg.replace("VAR", String(zone.intensity * 0.4)),
                      border: `1px solid ${colors.border}`,
                      backdropFilter: "blur(1px)",
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                    onTap={() => setActiveTooltip(activeTooltip === zone.label ? null : zone.label)}
                    onHoverStart={() => setActiveTooltip(zone.label)}
                    onHoverEnd={() => setActiveTooltip(null)}
                  >
                    <AnimatePresence>
                      {activeTooltip === zone.label && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.9 }}
                          animate={{ opacity: 1, y: -20, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.9 }}
                          className="absolute left-1/2 -translate-x-1/2 top-0 whitespace-nowrap bg-background/90 backdrop-blur-md border border-border rounded-lg px-2 py-1 text-[9px] font-medium text-foreground shadow-lg z-20 flex items-center gap-1"
                        >
                          <span>{zoneIcons[zone.type]}</span>
                          {zone.label}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* Corner scan brackets */}
              {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos, i) => (
                <motion.div
                  key={pos}
                  className={`absolute ${pos} w-5 h-5`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
                >
                  <div
                    className={`w-full h-full ${
                      i < 2 ? "border-t" : "border-b"
                    } ${i % 2 === 0 ? "border-l" : "border-r"} border-primary/40 ${
                      i < 2
                        ? i % 2 === 0 ? "rounded-tl-md" : "rounded-tr-md"
                        : i % 2 === 0 ? "rounded-bl-md" : "rounded-br-md"
                    }`}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Before / After label */}
        <div className="absolute bottom-2 left-2 z-10">
          <motion.div
            className="bg-background/80 backdrop-blur-sm rounded-xl px-2.5 py-1 border border-border/30"
            layout
          >
            <span className="text-[10px] font-semibold text-primary">
              {showGlow ? "✨ After (Glow)" : "📸 Before"}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setShowLandmarks(!showLandmarks)}
          className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-[10px] font-medium transition-all ${
            showLandmarks
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-muted/30 text-muted-foreground border border-transparent"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Landmarks
        </button>
        <button
          onClick={() => setShowIssues(!showIssues)}
          className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-[10px] font-medium transition-all ${
            showIssues
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-muted/30 text-muted-foreground border border-transparent"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Issues
        </button>
        <button
          onClick={() => setShowGlow(!showGlow)}
          className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-[10px] font-medium transition-all ${
            showGlow
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-muted/30 text-muted-foreground border border-transparent"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Glow View
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { color: "bg-purple-500", label: "Eyes" },
          { color: "bg-pink-500", label: "Nose" },
          { color: "bg-sky-500", label: "Jawline" },
          { color: "bg-red-500/60", label: "Acne" },
          { color: "bg-purple-500/60", label: "Dark circles" },
          { color: "bg-yellow-500/60", label: "Oil zones" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
            <span className="text-[9px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FaceAnalysisOverlay;
