import { Link } from "react-router-dom";
import FaceNovaLogo from "@/components/FaceNovaLogo";

const Footer = () => (
  <footer className="py-12 px-4 border-t border-border/20 relative">
    {/* Subtle top glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px gradient-bg opacity-40" />
    
    <div className="container mx-auto flex flex-col items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2 font-display font-bold text-foreground">
        <FaceNovaLogo size={24} />
        <span className="gradient-text">FaceNova</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {[
          { to: "/features", label: "Features" },
          { to: "/how-it-works", label: "How It Works" },
          { to: "/pricing", label: "Pricing" },
          { to: "/faq", label: "FAQ" },
          { to: "/privacy", label: "Privacy Policy" },
          { to: "/terms", label: "Terms of Service" },
          { to: "/support", label: "Support" },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="hover:text-primary transition-colors duration-300"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p className="text-muted-foreground/60">© 2026 FaceNova. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
