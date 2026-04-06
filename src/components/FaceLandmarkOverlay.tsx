import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useSignedUrl } from "@/hooks/useSignedUrl";

// MediaPipe Face Mesh landmark index groups
const FACE_REGIONS = {
  // Right eye contour
  rightEye: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  // Left eye contour
  leftEye: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
  // Right eyebrow
  rightEyebrow: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
  // Left eyebrow
  leftEyebrow: [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],
  // Nose bridge + outline
  nose: [168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 164, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61, 39, 40, 185],
  // Lips outer
  lipsOuter: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185],
  // Lips inner
  lipsInner: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191],
  // Jawline
  jawline: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
  // Forehead (face oval top)
  faceOval: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10],
};

// Color scheme per region
const REGION_COLORS: Record<string, { dot: string; line: string; label: string }> = {
  rightEye: { dot: "hsl(270, 100%, 65%)", line: "hsla(270, 100%, 65%, 0.6)", label: "Eyes" },
  leftEye: { dot: "hsl(270, 100%, 65%)", line: "hsla(270, 100%, 65%, 0.6)", label: "Eyes" },
  rightEyebrow: { dot: "hsl(270, 80%, 70%)", line: "hsla(270, 80%, 70%, 0.4)", label: "Brows" },
  leftEyebrow: { dot: "hsl(270, 80%, 70%)", line: "hsla(270, 80%, 70%, 0.4)", label: "Brows" },
  nose: { dot: "hsl(330, 100%, 60%)", line: "hsla(330, 100%, 60%, 0.5)", label: "Nose" },
  lipsOuter: { dot: "hsl(330, 80%, 55%)", line: "hsla(330, 80%, 55%, 0.5)", label: "Lips" },
  lipsInner: { dot: "hsl(330, 80%, 55%)", line: "hsla(330, 80%, 55%, 0.35)", label: "Lips" },
  jawline: { dot: "hsl(200, 80%, 55%)", line: "hsla(200, 80%, 55%, 0.5)", label: "Jawline" },
  faceOval: { dot: "hsl(160, 60%, 50%)", line: "hsla(160, 60%, 50%, 0.25)", label: "Contour" },
};

interface FaceLandmarkOverlayProps {
  photoUrl: string | null | undefined;
  overallScore: number;
  skinScore: number | null;
  acneScore: number;
  darkSpotScore: number;
}

// Landmark data type
interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

const FaceLandmarkOverlay = ({
  photoUrl,
  overallScore,
  skinScore,
  acneScore,
  darkSpotScore,
}: FaceLandmarkOverlayProps) => {
  const signedUrl = useSignedUrl(photoUrl);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number>(0);

  const [showOverlay, setShowOverlay] = useState(true);
  const [landmarks, setLandmarks] = useState<LandmarkPoint[] | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [activeRegions, setActiveRegions] = useState<Record<string, boolean>>({
    rightEye: true, leftEye: true,
    rightEyebrow: true, leftEyebrow: true,
    nose: true, lipsOuter: true, lipsInner: true,
    jawline: true, faceOval: false,
  });

  // Load image
  useEffect(() => {
    if (!signedUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
    };
    img.onerror = () => setError("Failed to load image");
    img.src = signedUrl;
  }, [signedUrl]);

  // Run MediaPipe Face Mesh detection
  useEffect(() => {
    if (!imgLoaded || !imgRef.current || landmarks) return;

    const detect = async () => {
      setDetecting(true);
      setError(null);

      try {
        const vision = await import("@mediapipe/tasks-vision");
        const { FaceLandmarker, FilesetResolver } = vision;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "IMAGE",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });

        const result = faceLandmarker.detect(imgRef.current!);

        if (result.faceLandmarks && result.faceLandmarks.length > 0) {
          setLandmarks(result.faceLandmarks[0] as LandmarkPoint[]);
        } else {
          setError("No face detected in image");
        }

        faceLandmarker.close();
      } catch (err) {
        console.error("MediaPipe detection error:", err);
        setError("Face detection failed. Try refreshing.");
      } finally {
        setDetecting(false);
      }
    };

    detect();
  }, [imgLoaded, landmarks]);

  // Draw canvas
  const drawCanvas = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const img = imgRef.current;
      if (!canvas || !container || !img || !landmarks) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Match canvas to container size
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Scale factors: landmarks are normalized [0,1]
      const scaleX = rect.width;
      const scaleY = rect.height;

      // Pulse animation
      const pulse = 0.6 + Math.sin(timestamp / 400) * 0.4;
      const dotPulse = 1.2 + Math.sin(timestamp / 300) * 0.5;

      if (!showOverlay) return;

      // Draw each region
      Object.entries(FACE_REGIONS).forEach(([regionKey, indices]) => {
        if (!activeRegions[regionKey]) return;
        const colors = REGION_COLORS[regionKey];
        if (!colors) return;

        // Draw connecting lines
        ctx.beginPath();
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = regionKey === "faceOval" ? 0.8 : 1.2;
        ctx.lineJoin = "round";

        indices.forEach((idx, i) => {
          const pt = landmarks[idx];
          if (!pt) return;
          const x = pt.x * scaleX;
          const y = pt.y * scaleY;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });

        // Close contours for eyes, lips, jawline
        if (["rightEye", "leftEye", "lipsOuter", "lipsInner", "faceOval"].includes(regionKey)) {
          ctx.closePath();
        }
        ctx.stroke();

        // Draw dots on landmarks
        indices.forEach((idx) => {
          const pt = landmarks[idx];
          if (!pt) return;
          const x = pt.x * scaleX;
          const y = pt.y * scaleY;

          // Outer glow
          const glowRadius = (regionKey === "faceOval" ? 2 : 3) * dotPulse;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius * 2);
          gradient.addColorStop(0, colors.dot.replace(")", `, ${0.5 * pulse})`).replace("hsl", "hsla"));
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, glowRadius * 2, 0, Math.PI * 2);
          ctx.fill();

          // Core dot
          ctx.fillStyle = colors.dot;
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.arc(x, y, regionKey === "faceOval" ? 1 : 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        });
      });

      // Scan line effect
      const scanY = (timestamp / 20) % rect.height;
      const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      scanGrad.addColorStop(0, "transparent");
      scanGrad.addColorStop(0.5, "hsla(270, 100%, 65%, 0.15)");
      scanGrad.addColorStop(1, "transparent");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 2, rect.width, 4);

      animFrameRef.current = requestAnimationFrame(drawCanvas);
    },
    [landmarks, showOverlay, activeRegions]
  );

  // Start animation loop
  useEffect(() => {
    if (landmarks && showOverlay) {
      animFrameRef.current = requestAnimationFrame(drawCanvas);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [landmarks, showOverlay, drawCanvas]);

  // Redraw on resize
  useEffect(() => {
    const handleResize = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (landmarks && showOverlay) {
        animFrameRef.current = requestAnimationFrame(drawCanvas);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [landmarks, showOverlay, drawCanvas]);

  const toggleRegion = (key: string) => {
    setActiveRegions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const landmarkCount = landmarks?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="glass-card rounded-3xl p-5 space-y-4 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm">AI Face Analysis</h3>
          {landmarks && (
            <span className="text-[9px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-full">
              {landmarkCount} points
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {showOverlay ? "Show AI Analysis" : "Photo Only"}
          </span>
          <Switch checked={showOverlay} onCheckedChange={setShowOverlay} />
        </div>
      </div>

      {/* Image + Canvas overlay */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-muted border border-border/30"
      >
        {/* Base image */}
        {signedUrl ? (
          <img
            src={signedUrl}
            alt="Face scan"
            crossOrigin="anonymous"
            className={`w-full h-full object-cover transition-all duration-700 ${
              showGlow ? "brightness-110 contrast-105 saturate-110" : ""
            }`}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
        )}

        {/* Glow overlay */}
        <AnimatePresence>
          {showGlow && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 45%, hsla(270, 100%, 65%, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 50% 50%, hsla(330, 100%, 60%, 0.06) 0%, transparent 50%)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Canvas for landmarks */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Loading state */}
        {detecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-foreground font-medium">Detecting facial landmarks...</p>
              <p className="text-[10px] text-muted-foreground">Using MediaPipe Face Mesh</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !detecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm">
            <div className="text-center space-y-1">
              <AlertCircle className="w-5 h-5 text-destructive mx-auto" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* Corner brackets */}
        {showOverlay &&
          ["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos, i) => (
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
                    ? i % 2 === 0
                      ? "rounded-tl-md"
                      : "rounded-tr-md"
                    : i % 2 === 0
                    ? "rounded-bl-md"
                    : "rounded-br-md"
                }`}
              />
            </motion.div>
          ))}

        {/* Before / After label */}
        <div className="absolute bottom-2 left-2 z-10">
          <div className="bg-background/80 backdrop-blur-sm rounded-xl px-2.5 py-1 border border-border/30">
            <span className="text-[10px] font-semibold text-primary">
              {showGlow ? "✨ After (Glow)" : landmarks ? "🧠 AI Detected" : "📸 Original"}
            </span>
          </div>
        </div>

        {/* Landmark count badge */}
        {landmarks && showOverlay && (
          <div className="absolute top-2 right-2 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-background/80 backdrop-blur-sm rounded-xl px-2 py-1 border border-primary/20"
            >
              <span className="text-[9px] font-semibold text-primary">{landmarkCount} landmarks</span>
            </motion.div>
          </div>
        )}
      </div>

      {/* Region toggles */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground font-medium">Toggle regions:</p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "rightEye", label: "Eyes", colorClass: "bg-purple-500" },
            { key: "rightEyebrow", label: "Brows", colorClass: "bg-purple-400" },
            { key: "nose", label: "Nose", colorClass: "bg-pink-500" },
            { key: "lipsOuter", label: "Lips", colorClass: "bg-pink-400" },
            { key: "jawline", label: "Jawline", colorClass: "bg-sky-500" },
            { key: "faceOval", label: "Contour", colorClass: "bg-emerald-500" },
          ].map((region) => {
            // For paired regions (eyes, brows, lips) toggle both
            const paired: Record<string, string> = {
              rightEye: "leftEye",
              rightEyebrow: "leftEyebrow",
              lipsOuter: "lipsInner",
            };
            const isActive = activeRegions[region.key];
            return (
              <button
                key={region.key}
                onClick={() => {
                  toggleRegion(region.key);
                  if (paired[region.key]) toggleRegion(paired[region.key]);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-muted/30 text-muted-foreground border border-transparent"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${region.colorClass} ${isActive ? "opacity-100" : "opacity-30"}`} />
                {region.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Glow toggle */}
      <button
        onClick={() => setShowGlow(!showGlow)}
        className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[10px] font-medium transition-all ${
          showGlow
            ? "bg-primary/10 text-primary border border-primary/20"
            : "bg-muted/30 text-muted-foreground border border-transparent"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        {showGlow ? "Glow Enhancement Active" : "Preview Glow Enhancement"}
      </button>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center pt-1">
        {[
          { color: "bg-purple-500", label: "Eyes & Brows" },
          { color: "bg-pink-500", label: "Nose & Lips" },
          { color: "bg-sky-500", label: "Jawline" },
          { color: "bg-emerald-500", label: "Face Contour" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
            <span className="text-[9px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Tech info */}
      <div className="text-center">
        <p className="text-[9px] text-muted-foreground/60">
          Powered by MediaPipe Face Mesh • 468-point detection • Real-time coordinates
        </p>
      </div>
    </motion.div>
  );
};

export default FaceLandmarkOverlay;
