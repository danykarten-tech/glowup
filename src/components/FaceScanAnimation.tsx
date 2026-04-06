import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const scanMessages = [
  "Analyzing facial symmetry...",
  "Detecting skin texture...",
  "Scanning for acne and dark spots...",
  "Evaluating glow potential...",
];

// Facial landmark positions (relative %)
const landmarks = [
  { x: 50, y: 28, delay: 0.2 },   // forehead
  { x: 35, y: 38, delay: 0.5 },   // left eye
  { x: 65, y: 38, delay: 0.7 },   // right eye
  { x: 50, y: 48, delay: 1.0 },   // nose bridge
  { x: 50, y: 55, delay: 1.3 },   // nose tip
  { x: 40, y: 64, delay: 1.6 },   // left mouth
  { x: 60, y: 64, delay: 1.8 },   // right mouth
  { x: 50, y: 62, delay: 2.0 },   // mouth center
  { x: 28, y: 50, delay: 2.2 },   // left cheek
  { x: 72, y: 50, delay: 2.4 },   // right cheek
  { x: 50, y: 75, delay: 2.6 },   // chin
  { x: 30, y: 32, delay: 2.8 },   // left brow
  { x: 70, y: 32, delay: 3.0 },   // right brow
];

interface FaceScanAnimationProps {
  progress: number;
  photoUrl?: string;
  revealScore?: number | null;
}

const FaceScanAnimation = ({ progress, photoUrl, revealScore }: FaceScanAnimationProps) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % scanMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const showReveal = revealScore !== null && revealScore !== undefined && progress >= 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Blurred background photo */}
      {photoUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${photoUrl})`,
            filter: "blur(40px) brightness(0.3)",
            transform: "scale(1.2)",
          }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--glow-purple)/0.3)] via-transparent to-[hsl(var(--glow-pink)/0.3)]" />

      {/* Ambient glow orbs */}
      <motion.div
        className="absolute w-72 h-72 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, hsl(var(--glow-purple)) 0%, transparent 70%)" }}
        animate={{ x: [-30, 30, -30], y: [-20, 20, -20], scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-56 h-56 rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, hsl(var(--glow-pink)) 0%, transparent 70%)" }}
        animate={{ x: [20, -20, 20], y: [15, -15, 15], scale: [1.1, 0.9, 1.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <AnimatePresence mode="wait">
        {!showReveal ? (
          <motion.div
            key="scanning"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center gap-8"
          >
            {/* Face silhouette container */}
            <div className="relative w-56 h-72 md:w-64 md:h-80">
              {/* Silhouette outline */}
              <svg viewBox="0 0 200 260" className="w-full h-full" fill="none">
                <defs>
                  <linearGradient id="faceGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--glow-purple))" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="hsl(var(--glow-pink))" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <ellipse cx="100" cy="120" rx="70" ry="90" stroke="url(#faceGrad)" strokeWidth="1.5" opacity="0.5" />
                {/* Inner guide lines */}
                <line x1="100" y1="30" x2="100" y2="210" stroke="url(#faceGrad)" strokeWidth="0.5" opacity="0.2" />
                <line x1="30" y1="120" x2="170" y2="120" stroke="url(#faceGrad)" strokeWidth="0.5" opacity="0.2" />
              </svg>

              {/* Scanning line */}
              <motion.div
                className="absolute left-0 right-0 h-[2px]"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, hsl(var(--glow-purple)) 30%, hsl(var(--glow-pink)) 70%, transparent 100%)",
                  boxShadow: "0 0 20px hsl(var(--glow-purple) / 0.6), 0 0 40px hsl(var(--glow-pink) / 0.3)",
                }}
                animate={{ top: ["5%", "90%", "5%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Landmark dots */}
              {landmarks.map((lm, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${lm.x}%`,
                    top: `${lm.y}%`,
                    background: "hsl(var(--glow-purple))",
                    boxShadow: "0 0 8px hsl(var(--glow-purple) / 0.8), 0 0 16px hsl(var(--glow-pink) / 0.4)",
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0.6, 1],
                    scale: [0, 1.3, 0.8, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: lm.delay,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
              ))}

              {/* Corner brackets */}
              {[
                "top-0 left-2", "top-0 right-2",
                "bottom-0 left-2", "bottom-0 right-2",
              ].map((pos, i) => (
                <motion.div
                  key={pos}
                  className={`absolute ${pos} w-6 h-6`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  <div
                    className={`absolute w-full h-full ${
                      i < 2 ? "border-t-2" : "border-b-2"
                    } ${i % 2 === 0 ? "border-l-2" : "border-r-2"} border-primary/50 ${
                      i < 2
                        ? i % 2 === 0 ? "rounded-tl-md" : "rounded-tr-md"
                        : i % 2 === 0 ? "rounded-bl-md" : "rounded-br-md"
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            {/* Dynamic text */}
            <div className="flex flex-col items-center gap-4 min-h-[80px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="font-display text-base md:text-lg font-semibold text-foreground text-center"
                >
                  {scanMessages[msgIndex]}
                </motion.p>
              </AnimatePresence>

              {/* Progress bar */}
              <div className="w-56 md:w-64">
                <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, hsl(var(--glow-purple)), hsl(var(--glow-pink)))",
                      boxShadow: "0 0 12px hsl(var(--glow-purple) / 0.5)",
                    }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2 font-medium tabular-nums">
                  {Math.round(progress)}%
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Score reveal */
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, duration: 0.6 }}
            className="relative z-10 flex flex-col items-center gap-4"
          >
            <motion.div
              className="w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(var(--glow-purple)), hsl(var(--glow-pink)))",
                boxShadow: "0 0 60px hsl(var(--glow-purple) / 0.5), 0 0 120px hsl(var(--glow-pink) / 0.3)",
              }}
              animate={{ boxShadow: [
                "0 0 60px hsl(270 80% 60% / 0.5), 0 0 120px hsl(330 80% 60% / 0.3)",
                "0 0 80px hsl(270 80% 60% / 0.7), 0 0 160px hsl(330 80% 60% / 0.5)",
                "0 0 60px hsl(270 80% 60% / 0.5), 0 0 120px hsl(330 80% 60% / 0.3)",
              ]}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.span
                className="font-display text-5xl md:text-6xl font-extrabold text-primary-foreground"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              >
                {revealScore}
              </motion.span>
            </motion.div>
            <motion.p
              className="font-display text-lg font-semibold text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Your Glow Score
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FaceScanAnimation;
