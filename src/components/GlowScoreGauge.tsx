import { motion } from "framer-motion";

interface GlowScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

const GlowScoreGauge = ({ score, size = 200, label = "Glow Score" }: GlowScoreGaugeProps) => {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Ambient glow behind the gauge */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-30"
          style={{
            background: `conic-gradient(from 0deg, hsl(var(--glow-purple) / 0.4), hsl(var(--glow-pink) / 0.3), transparent)`,
          }}
        />

        <svg width={size} height={size} className="-rotate-90 relative z-10">
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="6"
            opacity={0.5}
          />

          {/* Animated progress arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#glowGradientPremium)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            filter="url(#glowFilter)"
          />

          {/* Glow filter */}
          <defs>
            <linearGradient id="glowGradientPremium" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--glow-purple))" />
              <stop offset="50%" stopColor="hsl(var(--glow-pink))" />
              <stop offset="100%" stopColor="hsl(var(--glow-violet))" />
            </linearGradient>
            <filter id="glowFilter">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Center score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <motion.span
            className="font-display font-black gradient-text leading-none"
            style={{ fontSize: size * 0.28 }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1, type: "spring", stiffness: 200 }}
          >
            {score}
          </motion.span>
          <motion.span
            className="text-xs text-muted-foreground font-medium mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            / 100
          </motion.span>
        </div>
      </div>
      <p className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">{label}</p>
    </div>
  );
};

export default GlowScoreGauge;
