import { motion } from "framer-motion";

const scanPoints = [
  { x: 48, y: 15, delay: 0, size: 7 },
  { x: 36, y: 26, delay: 0.2, size: 6 },
  { x: 60, y: 26, delay: 0.3, size: 6 },
  { x: 30, y: 36, delay: 0.5, size: 5 },
  { x: 66, y: 36, delay: 0.6, size: 5 },
  { x: 48, y: 40, delay: 0.8, size: 7 },
  { x: 38, y: 48, delay: 1.0, size: 6 },
  { x: 58, y: 48, delay: 1.1, size: 6 },
  { x: 48, y: 54, delay: 1.3, size: 5 },
  { x: 40, y: 62, delay: 1.5, size: 5 },
  { x: 56, y: 62, delay: 1.6, size: 5 },
  { x: 48, y: 70, delay: 1.8, size: 6 },
  { x: 33, y: 43, delay: 0.7, size: 4 },
  { x: 63, y: 43, delay: 0.9, size: 4 },
  { x: 28, y: 53, delay: 1.2, size: 4 },
  { x: 68, y: 53, delay: 1.4, size: 4 },
];

const scanLines = [
  { x1: 48, y1: 15, x2: 36, y2: 26, delay: 0.3 },
  { x1: 48, y1: 15, x2: 60, y2: 26, delay: 0.4 },
  { x1: 36, y1: 26, x2: 30, y2: 36, delay: 0.6 },
  { x1: 60, y1: 26, x2: 66, y2: 36, delay: 0.7 },
  { x1: 30, y1: 36, x2: 48, y2: 40, delay: 0.9 },
  { x1: 66, y1: 36, x2: 48, y2: 40, delay: 1.0 },
  { x1: 33, y1: 43, x2: 38, y2: 48, delay: 1.1 },
  { x1: 63, y1: 43, x2: 58, y2: 48, delay: 1.2 },
  { x1: 38, y1: 48, x2: 48, y2: 54, delay: 1.4 },
  { x1: 58, y1: 48, x2: 48, y2: 54, delay: 1.5 },
  { x1: 40, y1: 62, x2: 48, y2: 70, delay: 1.9 },
  { x1: 56, y1: 62, x2: 48, y2: 70, delay: 2.0 },
  { x1: 36, y1: 26, x2: 60, y2: 26, delay: 0.5 },
  { x1: 28, y1: 53, x2: 40, y2: 62, delay: 1.6 },
  { x1: 68, y1: 53, x2: 56, y2: 62, delay: 1.7 },
];

const HeroScanAnimation = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Mesh grid overlay for tech feel */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* White glow filter */}
        <defs>
          <filter id="glow-white">
            <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {scanLines.map((line, i) => (
          <motion.line
            key={`line-${i}`}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="white"
            strokeWidth="0.18"
            filter="url(#glow-white)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.85, 0.45] }}
            transition={{
              duration: 1.5,
              delay: line.delay,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeOut",
            }}
          />
        ))}
      </svg>

      {scanPoints.map((point, i) => (
        <motion.div
          key={`point-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            transform: "translate(-50%, -50%)",
            width: point.size,
            height: point.size,
            background: `radial-gradient(circle, white, hsl(0 0% 100% / 0.7))`,
            boxShadow: `0 0 6px 2px hsl(0 0% 100% / 0.5), 0 0 12px 4px hsl(var(--primary) / 0.3)`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.7] }}
          transition={{
            duration: 1.2,
            delay: point.delay,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeOut",
          }}
        >
          {/* Pulsing outer glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle, hsl(0 0% 100% / 0.5), transparent)` }}
            animate={{ scale: [1, 3.5], opacity: [0.7, 0] }}
            transition={{
              duration: 2,
              delay: point.delay + 0.3,
              repeat: Infinity,
              repeatDelay: 4,
            }}
          />
        </motion.div>
      ))}

      {/* Scan line sweep - sleek beam effect */}
      <motion.div
        className="absolute left-0 right-0 h-[1.5px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.4) 20%, hsl(0 0% 100% / 0.85) 50%, hsl(var(--primary) / 0.4) 80%, transparent 100%)`,
          boxShadow: `0 0 8px 2px hsl(var(--primary) / 0.25), 0 0 20px 4px hsl(var(--primary) / 0.12)`,
        }}
        initial={{ top: "8%" }}
        animate={{ top: ["8%", "78%", "8%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
      />
      {/* Subtle trailing glow */}
      <motion.div
        className="absolute left-0 right-0 h-[24px] pointer-events-none"
        style={{
          background: `linear-gradient(180deg, hsl(var(--primary) / 0.08) 0%, transparent 100%)`,
        }}
        initial={{ top: "8%" }}
        animate={{ top: ["8%", "78%", "8%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
      />
    </div>
  );
};

export default HeroScanAnimation;
