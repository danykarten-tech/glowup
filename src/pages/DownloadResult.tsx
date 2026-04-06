import { useRef, useState } from "react";
import DownloadableResultCard from "@/components/DownloadableResultCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Image, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { usePlan } from "@/hooks/usePlan";
import UpgradePrompt from "@/components/UpgradePrompt";

const DownloadResult = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { isPaid } = usePlan();

  if (!isPaid) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link to="/results"><ArrowLeft className="w-4 h-4" /> Back to Results</Link>
        </Button>
        <UpgradePrompt
          title="Downloads are a Premium Feature"
          description="Upgrade to Premium to download your glow-up results as PNG or PDF."
        />
      </div>
    );
  }

  const captureCard = async () => {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
    return canvas;
  };

  const handleDownloadPNG = async () => {
    setDownloading(true);
    try {
      const canvas = await captureCard();
      if (!canvas) throw new Error("Could not capture");
      const link = document.createElement("a");
      link.download = "facenova-result.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Downloaded!", description: "Your result card has been saved as PNG." });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const canvas = await captureCard();
      if (!canvas) throw new Error("Could not capture");
      const imgData = canvas.toDataURL("image/png");

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>FaceNova Results</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;">
              <img src="${imgData}" style="max-width:100%;height:auto;" />
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() { window.close(); };
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
      toast({ title: "PDF Ready!", description: "Use the print dialog to save as PDF." });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadHD = async () => {
    setDownloading(true);
    try {
      if (!cardRef.current) throw new Error("Card not found");
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 4,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = "facenova-result-hd.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "HD Downloaded!", description: "High-resolution result card saved." });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link to="/results"><ArrowLeft className="w-4 h-4" /> Back to Results</Link>
      </Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-display text-3xl font-bold mb-2">Download Results</h1>
        <p className="text-muted-foreground">Save your glow-up card in your preferred format.</p>
      </motion.div>

      <div className="flex justify-center">
        <DownloadableResultCard ref={cardRef} />
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleDownloadPNG} disabled={downloading}>
          <Image className="w-6 h-6 text-primary" />
          <span className="text-xs">PNG Image</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={handleDownloadPDF} disabled={downloading}>
          <FileText className="w-6 h-6 text-primary" />
          <span className="text-xs">PDF Report</span>
        </Button>
      </div>

      <div className="text-center">
        <Button
          className="gradient-bg border-0 text-primary-foreground gap-2"
          onClick={handleDownloadHD}
          disabled={downloading}
        >
          <Download className="w-4 h-4" />
          {downloading ? "Preparing..." : "Download HD Version"}
        </Button>
      </div>
    </div>
  );
};

export default DownloadResult;
