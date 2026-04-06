import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { User, Crown, LogOut, Settings, ChevronRight, MessageSquare, Shield, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null; plan: string; created_at: string } | null>(null);
  const [name, setName] = useState("");
  const [analysisCount, setAnalysisCount] = useState(0);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [pRes, aRes] = await Promise.all([
        supabase.from("profiles").select("full_name, plan, created_at").eq("id", user.id).single(),
        supabase.from("analysis_history").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (pRes.data) {
        setProfile(pRes.data);
        setName(pRes.data.full_name || "");
      }
      setAnalysisCount(aRes.count || 0);
    };
    fetch();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() })
      .eq("id", user.id);
    if (error) {
      // Fallback: try upsert if profile row doesn't exist yet
      const { error: upsertErr } = await supabase
        .from("profiles")
        .upsert({ id: user.id, full_name: name.trim() }, { onConflict: "id" });
      if (upsertErr) {
        toast({ title: "Error", description: upsertErr.message, variant: "destructive" });
        return;
      }
    }
    setProfile((prev) => prev ? { ...prev, full_name: name.trim() } : prev);
    toast({ title: "Profile updated!" });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information.</p>
      </motion.div>

      <Card className="rounded-2xl">
        <CardContent className="p-6 flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h2 className="font-display text-xl font-bold">{profile?.full_name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Badge className="gradient-bg border-0 text-primary-foreground gap-1 px-3 py-1">
            <Crown className="w-3 h-3" />
            {profile?.plan === "ultimate" ? "Ultimate" : profile?.plan === "pro" ? "Pro" : "Free"}
          </Badge>
          <p className="text-xs text-muted-foreground">
            Member since {memberSince} · {analysisCount} analyses completed
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="font-display text-lg">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ""} disabled />
          </div>
          <Button className="gradient-bg border-0 text-primary-foreground w-full" onClick={handleSave}>
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Quick Settings (mobile only) */}
      <Card className="rounded-2xl md:hidden">
        <CardHeader>
          <CardTitle className="font-display text-lg">Quick Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode-profile">Dark mode</Label>
            <Switch id="dark-mode-profile" checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifs-profile">Email notifications</Label>
            <Switch id="email-notifs-profile" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="tips-notifs-profile">Weekly glow-up tips</Label>
            <Switch id="tips-notifs-profile" defaultChecked />
          </div>
          <Separator />
          <Link to="/support" className="flex items-center justify-between py-1 hover:text-primary transition-colors">
            <span className="flex items-center gap-3 text-sm font-medium">
              <MessageSquare className="w-4 h-4 text-primary" />
              Support & Feedback
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link to="/settings" className="flex items-center justify-between py-1 hover:text-primary transition-colors">
            <span className="flex items-center gap-3 text-sm font-medium">
              <Settings className="w-4 h-4 text-primary" />
              All Settings
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Separator />
          <Link to="/privacy" className="flex items-center justify-between py-1 hover:text-primary transition-colors">
            <span className="flex items-center gap-3 text-sm font-medium">
              <Shield className="w-4 h-4 text-primary" />
              Privacy Policy
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link to="/terms" className="flex items-center justify-between py-1 hover:text-primary transition-colors">
            <span className="flex items-center gap-3 text-sm font-medium">
              <FileText className="w-4 h-4 text-primary" />
              Terms of Service
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full gap-2 text-destructive" onClick={handleSignOut}>
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  );
};

export default Profile;
