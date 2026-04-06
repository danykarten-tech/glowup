import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, CreditCard, Crown, Search, TrendingUp, IndianRupee,
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileRow {
  id: string;
  full_name: string | null;
  plan: string;
  subscription_status: string;
  renewal_date: string | null;
  auto_renew_enabled: boolean;
  cancel_at_period_end: boolean;
  created_at: string;
}

interface PaymentRow {
  id: string;
  user_id: string;
  razorpay_payment_id: string | null;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Glow Plus",
  ultimate: "Glow Pro",
};

const statusColor = (s: string) => {
  if (s === "active") return "bg-emerald-500/20 text-emerald-600 border-0";
  if (s === "cancelled" || s === "expired") return "bg-destructive/20 text-destructive border-0";
  return "bg-muted text-muted-foreground border-0";
};

const paymentStatusColor = (s: string) => {
  if (s === "captured") return "bg-emerald-500/20 text-emerald-600 border-0";
  if (s === "failed") return "bg-destructive/20 text-destructive border-0";
  return "bg-amber-500/20 text-amber-600 border-0";
};

const AdminDashboard = () => {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const [pRes, payRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, plan, subscription_status, renewal_date, auto_renew_enabled, cancel_at_period_end, created_at").order("created_at", { ascending: false }),
        supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(200),
      ]);
      setProfiles((pRes.data as ProfileRow[]) || []);
      setPayments((payRes.data as PaymentRow[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const totalRevenue = payments
    .filter((p) => p.status === "captured")
    .reduce((sum, p) => sum + p.amount, 0);

  const activeSubscribers = profiles.filter((p) => p.plan !== "free" && p.subscription_status === "active").length;
  const totalUsers = profiles.length;

  const filteredProfiles = profiles.filter(
    (p) =>
      !search ||
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.id.includes(search) ||
      p.plan.includes(search.toLowerCase())
  );

  const filteredPayments = payments.filter(
    (p) =>
      !search ||
      p.user_id.includes(search) ||
      p.razorpay_payment_id?.includes(search) ||
      p.plan.includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Crown className="w-6 h-6 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Subscription statuses & payment history across all users.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="py-5 px-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-xl font-bold font-display">{totalUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="py-5 px-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Subscribers</p>
              <p className="text-xl font-bold font-display">{activeSubscribers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="py-5 px-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold font-display">₹{(totalRevenue / 100).toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, ID, or plan…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-xl"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="rounded-xl">
          <TabsTrigger value="users" className="rounded-lg gap-1.5">
            <Users className="w-4 h-4" /> Users ({filteredProfiles.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg gap-1.5">
            <CreditCard className="w-4 h-4" /> Payments ({filteredPayments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Renewal</TableHead>
                  <TableHead>Auto-Renew</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.full_name || "—"}
                      <span className="block text-[10px] text-muted-foreground font-mono">{p.id.slice(0, 8)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">
                        {PLAN_LABELS[p.plan] || p.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusColor(p.subscription_status)}`}>
                        {p.subscription_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.renewal_date
                        ? new Date(p.renewal_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {p.auto_renew_enabled ? "✅" : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProfiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.user_id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">
                        {PLAN_LABELS[p.plan] || p.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-display font-bold">₹{(p.amount / 100).toFixed(0)}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${paymentStatusColor(p.status)}`}>
                        {p.status === "captured" ? "Paid" : p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {p.razorpay_payment_id || "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No payments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
