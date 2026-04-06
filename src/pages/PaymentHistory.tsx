import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, CreditCard, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Payment {
  id: string;
  razorpay_payment_id: string | null;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

const PLAN_NAMES: Record<string, string> = {
  pro: "Glow Plus",
  ultimate: "Glow Pro",
};

const PaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setPayments((data as Payment[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return (
    <div className="p-4 md:p-10 max-w-2xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Receipt className="w-6 h-6 text-primary" />
          Payment History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">All your subscription payments in one place.</p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="py-12 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No payments yet. Subscribe to a plan to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="rounded-2xl">
                <CardContent className="py-4 px-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{PLAN_NAMES[p.plan] || p.plan}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(p.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        {p.razorpay_payment_id && (
                          <span className="font-mono text-[10px]">{p.razorpay_payment_id}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-display font-bold">₹{(p.amount / 100).toFixed(0)}</p>
                      <Badge className={
                        p.status === "captured"
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]"
                          : p.status === "failed"
                          ? "bg-destructive/20 text-destructive border-0 text-[10px]"
                          : "bg-muted text-muted-foreground border-0 text-[10px]"
                      }>
                        {p.status === "captured" ? "Paid" : p.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
