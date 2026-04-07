import { Link } from "react-router-dom";
import { Camera, BarChart3, Droplets } from "lucide-react";
import { motion } from "framer-motion";

interface QuickActionCardsProps {
  hasHistory: boolean;
  latestAnalysisId?: string;
}

const actions = [
  {
    label: "New Scan",
    icon: Camera,
    to: "/upload",
    gradient: "from-[hsl(270,100%,65%)] to-[hsl(280,90%,58%)]",
  },
  {
    label: "View Last Report",
    icon: BarChart3,
    to: "/results",
    gradient: "from-[hsl(330,100%,60%)] to-[hsl(340,90%,65%)]",
  },
  {
    label: "Improve Routine",
    icon: Droplets,
    to: "/product-recommendations",
    gradient: "from-[hsl(190,100%,50%)] to-[hsl(200,90%,45%)]",
  },
];

const QuickActionCards = ({ hasHistory, latestAnalysisId }: QuickActionCardsProps) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action, i) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.06 }}
        >
          <Link
            to={action.to === "/results" && latestAnalysisId ? "/results" : action.to}
            state={action.to === "/results" && latestAnalysisId ? { analysisId: latestAnalysisId } : undefined}
            className="block"
          >
            <div className="glass-card-hover rounded-2xl p-4 text-center space-y-2.5 cursor-pointer h-full">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mx-auto shadow-lg`}>
                <action.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-[11px] font-display font-semibold text-foreground leading-tight">
                {action.label}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickActionCards;
