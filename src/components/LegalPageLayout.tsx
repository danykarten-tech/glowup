import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FaceNovaLogo from "@/components/FaceNovaLogo";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const LegalPageLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Logged-in user: show back button to go back into the app
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="container mx-auto max-w-3xl px-4 h-14 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Link to="/dashboard" className="flex items-center gap-2 font-display font-bold text-base">
              <FaceNovaLogo size={28} />
              FaceNova
            </Link>
          </div>
        </div>
        <div className="container mx-auto max-w-3xl px-4 pt-8 pb-20">
          {children}
        </div>
      </div>
    );
  }

  // Public visitor: show full navbar + footer
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 pt-28 pb-20">
        {children}
      </div>

      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-display font-bold text-foreground">
            <FaceNovaLogo size={24} />
            FaceNova
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
          </div>
          <p>© 2026 FaceNova. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LegalPageLayout;
