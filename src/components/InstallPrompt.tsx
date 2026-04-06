import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_TTL_HOURS = 24;

const getIOSContext = () => {
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari =
    /Safari/i.test(ua) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|UCBrowser|SamsungBrowser|DuckDuckGo|GSA|Instagram|FBAN|FBAV|Line|TikTok/i.test(ua);
  return { isIOS, isSafari };
};

const isMobileUA = () => /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const location = useLocation();

  // Show on shared results pages or any page for mobile users
  const isSharedPage = location.pathname.startsWith("/shared/") || location.pathname === "/results" || location.pathname === "/";

  useEffect(() => {
    try {
      if (window.self !== window.top) return;
    } catch {
      return;
    }

    if (window.location.hostname.includes("id-preview--")) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const dismissedAt = localStorage.getItem("pwa-install-dismissed-at");
    if (dismissedAt) {
      const hoursSinceDismiss = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < DISMISS_TTL_HOURS) return;
      localStorage.removeItem("pwa-install-dismissed-at");
    }

    const { isIOS } = getIOSContext();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    let timer: ReturnType<typeof setTimeout> | null = null;

    // Show banner after a short delay for iOS or shared pages
    if (isIOS || isSharedPage) {
      timer = setTimeout(() => setShowBanner(true), 2000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (timer) clearTimeout(timer);
    };
  }, [isSharedPage]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Install FaceNova",
        description: "Open your browser menu and tap 'Add to Home Screen' or 'Install App'.",
      });
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed-at", Date.now().toString());
  };

  if (!showBanner) return null;

  const { isIOS, isSafari } = getIOSContext();
  const mobile = isMobileUA();

  // Desktop: show a top banner on shared/landing pages
  if (!mobile) {
    if (!isSharedPage) return null;
    return (
      <div className="fixed top-0 left-0 right-0 z-[60] animate-in slide-in-from-top-4 duration-300">
        <div className="bg-gradient-to-r from-primary/90 to-accent/90 backdrop-blur-xl px-4 py-3 flex items-center justify-center gap-4">
          <Smartphone className="w-5 h-5 text-primary-foreground shrink-0" />
          <p className="text-sm font-medium text-primary-foreground">
            Get FaceNova on your phone for the best experience
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs font-semibold"
            onClick={handleInstall}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Install App
          </Button>
          <button onClick={handleDismiss} className="text-primary-foreground/70 hover:text-primary-foreground p-1 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Mobile: bottom banner
  return (
    <div className="fixed bottom-20 left-3 right-3 z-[60] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xl flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-primary-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground">Install FaceNova</p>

          {isIOS ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              {isSafari ? (
                <>Tap Share <span className="inline-block">⎙</span> then "Add to Home Screen"</>
              ) : (
                <>Open this link in Safari first, then tap Share <span className="inline-block">⎙</span> and "Add to Home Screen"</>
              )}
            </p>
          ) : deferredPrompt ? (
            <>
              <p className="text-xs text-muted-foreground mt-0.5">Add to your home screen for quick access</p>
              <Button
                size="sm"
                className="gradient-bg border-0 text-primary-foreground mt-2 h-8 text-xs"
                onClick={handleInstall}
              >
                Install App
              </Button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">
              Open browser menu (⋮) and tap "Add to Home Screen"
            </p>
          )}
        </div>

        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
