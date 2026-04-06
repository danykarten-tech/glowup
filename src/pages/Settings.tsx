import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { FileText, Shield, ChevronRight } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import SubscriptionManagement from "@/components/SubscriptionManagement";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const planInfo = usePlan();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSave = () => toast({ title: "Settings saved!" });

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences.</p>
      </motion.div>

      {/* Subscription Management */}
      <SubscriptionManagement planInfo={planInfo} />

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="font-display text-lg">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifs">Email notifications</Label>
            <Switch id="email-notifs" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="tips-notifs">Weekly glow-up tips</Label>
            <Switch id="tips-notifs" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="promo-notifs">Promotional offers</Label>
            <Switch id="promo-notifs" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="font-display text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">Dark mode</Label>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="font-display text-lg">Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="save-history">Save analysis history</Label>
            <Switch id="save-history" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="public-profile">Public profile</Label>
            <Switch id="public-profile" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="font-display text-lg">Legal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link to="/privacy" className="flex items-center justify-between py-2 hover:text-primary transition-colors">
            <span className="flex items-center gap-3 text-sm font-medium">
              <Shield className="w-4 h-4 text-primary" />
              Privacy Policy
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link to="/terms" className="flex items-center justify-between py-2 hover:text-primary transition-colors">
            <span className="flex items-center gap-3 text-sm font-medium">
              <FileText className="w-4 h-4 text-primary" />
              Terms of Service
            </span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex flex-col gap-3">
        <Button className="gradient-bg border-0 text-primary-foreground" onClick={handleSave}>
          Save Changes
        </Button>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={() => toast({ title: "Coming Soon", description: "Account deletion will be available soon." })}
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
};

export default Settings;
