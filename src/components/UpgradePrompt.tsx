import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface UpgradePromptProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

const UpgradePrompt = ({
  title = "Pro Feature",
  description = "Upgrade to Pro or Ultimate to unlock this feature.",
  compact = false,
}: UpgradePromptProps) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
        <p className="text-sm text-muted-foreground flex-1">{description}</p>
        <Button size="sm" className="gradient-bg border-0 text-primary-foreground gap-1" asChild>
          <Link to="/plans">
            <Crown className="w-3 h-3" />
            Upgrade
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="gradient-bg p-[1px] border-0 rounded-2xl">
        <CardContent className="bg-card rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="font-display text-xl font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
          <Button className="gradient-bg border-0 text-primary-foreground gap-2" asChild>
            <Link to="/plans">
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UpgradePrompt;
