import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import FaceScanAnimation from "@/components/FaceScanAnimation";

const Analyzing = () => {
  const [progress, setProgress] = useState(0);
  const [revealScore, setRevealScore] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const photoUrl = (location.state as { photoUrl?: string; storagePath?: string })?.photoUrl;
  const storagePath = (location.state as { storagePath?: string })?.storagePath;
  const analysisStarted = useRef(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisScore, setAnalysisScore] = useState<number | null>(null);

  // Start AI analysis
  useEffect(() => {
    if (!photoUrl || analysisStarted.current) return;
    analysisStarted.current = true;

    const analyze = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-photo`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ photo_url: photoUrl, storage_path: storagePath }),
          }
        );

        if (!response.ok) {
          const err = await response.json();
          if (err.error === "no_face_detected") {
            toast({
              title: "😕 No Face Detected",
              description: "We couldn't detect a face in your photo. Please upload a clear front-facing selfie with your face fully visible.",
              variant: "destructive",
            });
            navigate("/upload", { state: { error: "no_face" } });
            return;
          }
          if (err.error === "multiple_faces") {
            toast({
              title: "👥 Multiple Faces Detected",
              description: err.message || "Please upload a photo with only one face visible.",
              variant: "destructive",
            });
            navigate("/upload", { state: { error: "multiple_faces" } });
            return;
          }
          if (err.error === "limit_reached") {
            toast({
              title: "Monthly limit reached",
              description: err.message || "Upgrade your plan for more analyses.",
              variant: "destructive",
            });
            navigate("/plans");
            return;
          }
          throw new Error(err.error || "Analysis failed");
        }

        const result = await response.json();
        setAnalysisId(result.id);
        setAnalysisScore(result.overall_score ?? result.overallScore ?? 82);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Analysis failed";
        toast({ title: "Analysis failed", description: message, variant: "destructive" });
        navigate("/upload");
      }
    };

    analyze();
  }, [photoUrl, navigate, storagePath]);

  // Progress bar — cap at 90% until analysis done
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const cap = analysisId ? 100 : 90;
        return Math.min(prev + 1.5, cap);
      });
    }, 150);
    return () => clearInterval(interval);
  }, [analysisId]);

  // Show score reveal when progress hits 100
  useEffect(() => {
    if (analysisId && progress >= 100 && analysisScore !== null && revealScore === null) {
      setRevealScore(analysisScore);
    }
  }, [analysisId, progress, analysisScore, revealScore]);

  // Navigate to results after reveal
  useEffect(() => {
    if (revealScore !== null) {
      const timer = setTimeout(() => navigate("/results", { state: { analysisId } }), 2200);
      return () => clearTimeout(timer);
    }
  }, [revealScore, analysisId, navigate]);

  return (
    <FaceScanAnimation
      progress={progress}
      photoUrl={photoUrl}
      revealScore={revealScore}
    />
  );
};

export default Analyzing;
