import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentFailed = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl bg-card border border-border/50 p-8 text-center space-y-6 shadow-xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto"
          >
            <XCircle className="w-10 h-10 text-destructive" />
          </motion.div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold">Payment Not Completed</h1>
            <p className="text-sm text-muted-foreground">
              Your payment was not completed. No charges were made. You can try again anytime.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button className="gradient-bg border-0 text-primary-foreground gap-2 w-full rounded-2xl h-12" asChild>
              <Link to="/plans">
                Try Again
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="ghost" className="w-full rounded-2xl" asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;
