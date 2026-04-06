import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PhotoUploader from "@/components/PhotoUploader";
import TrustBadges from "@/components/TrustBadges";
import { ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { usePlan } from "@/hooks/usePlan";
import UpgradePrompt from "@/components/UpgradePrompt";

const UploadPhoto = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const errorState = (location.state as { error?: string })?.error;
  const { canAnalyze, remainingDailyAnalyses, remainingMonthlyAnalyses, isPaid, loading: planLoading } = usePlan();

  const uploadSelfie = async (selectedFile: File, userId: string) => {
    const sanitizedName = selectedFile.name.replace(/\s+/g, "-");
    const path = `${userId}/${crypto.randomUUID()}-${sanitizedName}`;

    const { error } = await supabase.storage.from("selfies").upload(path, selectedFile, {
      contentType: selectedFile.type || "image/jpeg",
      upsert: true,
    });

    if (error) throw error;

    // Generate a signed URL for the AI to access during analysis
    const { data: signedData, error: signedError } = await supabase.storage
      .from("selfies")
      .createSignedUrl(path, 3600);

    if (signedError || !signedData?.signedUrl) throw signedError || new Error("Failed to get signed URL");
    
    return { signedUrl: signedData.signedUrl, storagePath: path };
  };

  const handleAnalyze = async () => {
    if (!file || !user) {
      toast({ title: "Please select a photo first", variant: "destructive" });
      return;
    }

    if (!canAnalyze) {
      toast({ title: "Monthly limit reached", description: "Upgrade your plan for more analyses.", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      const { signedUrl, storagePath } = await uploadSelfie(file, user.id);
      navigate("/analyzing", { state: { photoUrl: signedUrl, storagePath } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong while uploading.";
      toast({ title: "Upload failed", description: message, variant: "destructive" });
      setUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Upload Your Selfie</h1>
        <p className="text-muted-foreground">Take a front-facing photo with good lighting for best results.</p>
        {!planLoading && !isPaid && (
          <p className="text-sm text-muted-foreground mt-2">
            {canAnalyze
              ? `${remainingDailyAnalyses} today · ${remainingMonthlyAnalyses} this month remaining`
              : remainingDailyAnalyses === 0 ? "Daily limit reached — come back tomorrow!" : "Monthly limit reached"}
          </p>
        )}
      </motion.div>

      {errorState === "no_face" && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed — No Face Detected</AlertTitle>
          <AlertDescription>
            We couldn't detect a face in your previous photo. Please upload a clear, front-facing selfie with your full face visible and good lighting.
          </AlertDescription>
        </Alert>
      )}

      {errorState === "multiple_faces" && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Multiple Faces Detected</AlertTitle>
          <AlertDescription>
            We detected more than one face in your photo. Please upload a photo with only your face visible — crop or retake the photo so only you are in the frame.
          </AlertDescription>
        </Alert>
      )}

      {!planLoading && !canAnalyze ? (
        <UpgradePrompt
          title="Monthly Limit Reached"
          description="You've used all your free analyses this month. Upgrade to Pro (₹99/mo) for 30 analyses or Ultimate (₹199/mo) for unlimited."
        />
      ) : (
        <>
          <PhotoUploader onPhotoSelected={(selectedFile?: File) => setFile(selectedFile || null)} />

          {file && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-8">
              <Button
                size="lg"
                className="gradient-bg border-0 text-primary-foreground gap-2 px-8 py-3 min-h-[48px] text-base"
                onClick={handleAnalyze}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Analyze My Photo"}
                {!uploading && <ArrowRight className="w-5 h-5" />}
              </Button>
            </motion.div>
          )}
        </>
      )}

      <div className="mt-8 p-4 rounded-xl bg-muted text-center">
        <p className="text-xs text-muted-foreground">
          📸 Tips: Use natural lighting • Face the camera directly • No filters or heavy makeup
        </p>
      </div>

      <TrustBadges className="mt-6" />
    </div>
  );
};

export default UploadPhoto;
