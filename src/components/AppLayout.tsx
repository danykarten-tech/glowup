import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Upload, History, Settings, User, ShoppingBag, Crown, MessageSquare, Shield, Flame } from "lucide-react";
import FaceNovaLogo from "@/components/FaceNovaLogo";
import InstallPrompt from "@/components/InstallPrompt";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload", href: "/upload", icon: Upload },
  { label: "History", href: "/history", icon: History },
  { label: "Products", href: "/products", icon: ShoppingBag },
  { label: "Plans & Pricing", href: "/plans", icon: Crown },
  { label: "Glow Challenge", href: "/glow-challenge", icon: Flame },
  { label: "Support", href: "/support", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Profile", href: "/profile", icon: User },
];

const mobileTabLinks = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload", href: "/upload", icon: Upload },
  { label: "History", href: "/history", icon: History },
  { label: "Products", href: "/products", icon: ShoppingBag },
  { label: "Profile", href: "/profile", icon: User },
];

const AppLayout = () => {
  const location = useLocation();
  const isAdmin = useIsAdmin();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/30 p-4"
        style={{
          background: 'hsl(var(--card) / 0.4)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <Link to="/dashboard" className="flex items-center gap-2 font-display font-bold text-lg mb-8 px-2">
          <FaceNovaLogo size={32} />
          <span>FaceNova</span>
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "gradient-bg-subtle text-primary glow-shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
          {isAdmin && (
            <>
              <div className="border-t border-border/30 my-2" />
              <Link
                to="/admin/dashboard"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === "/admin/dashboard"
                    ? "gradient-bg-subtle text-primary glow-shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
              <Link
                to="/admin/products"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  location.pathname === "/admin/products"
                    ? "gradient-bg-subtle text-primary glow-shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Manage Products
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Tab */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/30"
        style={{
          background: 'hsl(var(--card) / 0.8)',
          backdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        <div className="flex items-center justify-around py-2">
          {mobileTabLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-all duration-300 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className={`relative ${isActive ? 'glow-shadow-sm' : ''} rounded-lg p-1`}>
                  <Icon className="w-5 h-5" />
                </div>
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <InstallPrompt />
    </div>
  );
};

export default AppLayout;
