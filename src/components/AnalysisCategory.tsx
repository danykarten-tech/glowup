import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface AnalysisCategoryProps {
  label: string;
  value: number;
  delay?: number;
}

const AnalysisCategory = ({ label, value, delay = 0 }: AnalysisCategoryProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="space-y-2"
  >
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <span className="font-semibold text-primary">{value}%</span>
    </div>
    <Progress value={value} className="h-2" />
  </motion.div>
);

export default AnalysisCategory;
