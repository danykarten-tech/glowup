import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Navigate } from "react-router-dom";
import { usePageTracking } from "@/hooks/usePageTracking";

import Index from "./pages/Index";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import FAQ from "./pages/FAQ";
import Dashboard from "./pages/Dashboard";
import UploadPhoto from "./pages/UploadPhoto";
import Analyzing from "./pages/Analyzing";
import Results from "./pages/Results";
import SymmetryAnalysis from "./pages/SymmetryAnalysis";
import SkinAnalysis from "./pages/SkinAnalysis";
import HairstyleRecommendation from "./pages/HairstyleRecommendation";
import StyleImprovement from "./pages/StyleImprovement";
import ShareResult from "./pages/ShareResult";
import DownloadResult from "./pages/DownloadResult";
import UserHistory from "./pages/UserHistory";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ProductRecommendations from "./pages/ProductRecommendations";
import Plans from "./pages/Plans";
import AppLayout from "./components/AppLayout";
import AdminProducts from "./pages/AdminProducts";
import AdminDashboard from "./pages/AdminDashboard";
import SharedResult from "./pages/SharedResult";
import Support from "./pages/Support";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentHistory from "./pages/PaymentHistory";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const PageTracker = ({ children }: { children: React.ReactNode }) => {
  usePageTracking();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageTracker>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<Features />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* Protected App Pages */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<UploadPhoto />} />
                <Route path="/analyzing" element={<Analyzing />} />
                <Route path="/results" element={<Results />} />
                <Route path="/results/symmetry" element={<SymmetryAnalysis />} />
                <Route path="/results/skin" element={<SkinAnalysis />} />
                <Route path="/results/hairstyle" element={<HairstyleRecommendation />} />
                <Route path="/results/style" element={<StyleImprovement />} />
                <Route path="/share" element={<ShareResult />} />
                <Route path="/download" element={<DownloadResult />} />
                <Route path="/history" element={<UserHistory />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/products" element={<ProductRecommendations />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/admin/products" element={<AdminGuard><AdminProducts /></AdminGuard>} />
                <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                <Route path="/support" element={<Support />} />
                <Route path="/payment-history" element={<PaymentHistory />} />
              </Route>

              {/* Payment Result Pages */}
              <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route path="/payment-failed" element={<PaymentFailed />} />

              {/* Public Share Page */}
              <Route path="/shared/:token" element={<SharedResult />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTracker>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
