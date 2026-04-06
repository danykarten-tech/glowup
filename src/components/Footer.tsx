import { Link } from "react-router-dom";
import FaceNovaLogo from "@/components/FaceNovaLogo";

const Footer = () => (
  <footer className="py-12 px-4 border-t border-border">
    <div className="container mx-auto flex flex-col items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2 font-display font-bold text-foreground">
        <FaceNovaLogo size={24} />
        FaceNova
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
        <Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
        <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
      </div>
      <p>© 2026 FaceNova. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
