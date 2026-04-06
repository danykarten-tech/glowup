import DownloadableResultCard from "@/components/DownloadableResultCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Download, MessageCircle, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useLatestAnalysis } from "@/hooks/useLatestAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useState, useCallback } from "react";
import html2canvas from "html2canvas";

const ShareResult = () => {
  const { analysis } = useLatestAnalysis();
  const [generating, setGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const generateShareLink = async () => {
    if (!analysis) return null;

    if (analysis.share_token) {
      const url = `${window.location.origin}/shared/${analysis.share_token}`;
      setShareUrl(url);
      return url;
    }

    setGenerating(true);
    const token = crypto.randomUUID();
    const { error } = await supabase
      .from("analysis_history")
      .update({ share_token: token })
      .eq("id", analysis.id);

    setGenerating(false);

    if (error) {
      toast({ title: "Failed to generate share link", variant: "destructive" });
      return null;
    }

    const url = `${window.location.origin}/shared/${token}`;
    setShareUrl(url);
    return url;
  };

  const shareText = `Check out my FaceNova score: ${analysis?.overall_score ?? 0}/100! ✨ Get your free analysis:`;

  const openExternal = useCallback((url: string) => {
    // Use anchor click instead of window.open to avoid COOP errors
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const handleCopy = async () => {
    const url = shareUrl || (await generateShareLink());
    if (!url) return;
    await navigator.clipboard.writeText(`${shareText} ${url}`);
    toast({ title: "Link copied!", description: "Share it with your friends." });
  };

  const handleWhatsApp = async () => {
    const url = shareUrl || (await generateShareLink());
    if (!url) return;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${url}`)}`;
    openExternal(waUrl);
  };

  const handleTwitter = async () => {
    const url = shareUrl || (await generateShareLink());
    if (!url) return;
    openExternal(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`
    );
  };

  const [instagramReady, setInstagramReady] = useState(false);
  const [instagramText, setInstagramText] = useState("");

  const handleInstagram = async () => {
    const url = shareUrl || (await generateShareLink());
    if (!url) return;
    const fullText = `${shareText} ${url}`;
    try {
      await navigator.clipboard.writeText(fullText);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = fullText;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setInstagramText(fullText);
    setInstagramReady(true);
    toast({
      title: "Link copied to clipboard! 📋",
      description: "Now tap 'Open Instagram' below to paste it in your story, bio, or DM.",
      duration: 8000,
    });
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0f0a1a",
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = "facenova-score.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Downloaded!", description: "Share this image on Instagram, WhatsApp Status, or anywhere!" });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  };

  const handleNativeShare = async () => {
    const url = shareUrl || (await generateShareLink());
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My FaceNova Score",
          text: shareText,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link to="/results"><ArrowLeft className="w-4 h-4" /> Back to Results</Link>
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Share Your Results</h1>
        <p className="text-muted-foreground">Show off your glow-up score and go viral! 🚀</p>
      </motion.div>

      <div className="flex justify-center" ref={cardRef}>
        <DownloadableResultCard />
      </div>

      <div className="space-y-3 max-w-sm mx-auto">
        {/* WhatsApp - primary viral channel */}
        <Button
          className="w-full gap-2 text-primary-foreground border-0"
          style={{ backgroundColor: "hsl(142, 70%, 40%)" }}
          onClick={handleWhatsApp}
          disabled={generating}
        >
          <MessageCircle className="w-4 h-4" />
          {generating ? "Generating..." : "Share on WhatsApp"}
        </Button>

        {/* Twitter / X */}
        <Button
          className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90 border-0"
          onClick={handleTwitter}
          disabled={generating}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          {generating ? "Generating..." : "Share on X (Twitter)"}
        </Button>

        {/* Instagram */}
        {!instagramReady ? (
          <Button
            className="w-full gap-2 text-primary-foreground border-0"
            style={{ background: "linear-gradient(45deg, hsl(37, 97%, 52%), hsl(330, 70%, 50%), hsl(270, 70%, 50%))" }}
            onClick={handleInstagram}
            disabled={generating}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            {generating ? "Generating..." : "Share on Instagram"}
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground break-all select-all text-center">
              {instagramText}
            </div>
            <Button
              className="w-full gap-2 text-primary-foreground border-0"
              style={{ background: "linear-gradient(45deg, hsl(37, 97%, 52%), hsl(330, 70%, 50%), hsl(270, 70%, 50%))" }}
              onClick={() => {
                openExternal("https://www.instagram.com/");
              }}
            >
              Open Instagram & Paste
            </Button>
          </div>
        )}

        {/* Download image for sharing */}
        <Button
          className="w-full gap-2"
          variant="outline"
          onClick={handleDownloadImage}
        >
          <Download className="w-4 h-4" />
          Download Image to Share
        </Button>

        {/* Copy link */}
        <Button className="w-full gap-2" variant="outline" onClick={handleCopy} disabled={generating}>
          <Copy className="w-4 h-4" />
          {generating ? "Generating link..." : "Copy Share Link"}
        </Button>

        {/* Native share (mobile) */}
        {"share" in navigator && (
          <Button className="w-full gap-2" variant="outline" onClick={handleNativeShare} disabled={generating}>
            <Share2 className="w-4 h-4" />
            More Sharing Options
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        💡 Tip: Download the image and post it on Instagram Stories, WhatsApp Status, or Snapchat to go viral!
      </p>
    </div>
  );
};

export default ShareResult;
