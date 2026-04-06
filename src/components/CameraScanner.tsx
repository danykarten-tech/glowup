import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Camera, Loader2, RefreshCcw, SwitchCamera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraScannerProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  onUseUploadFallback: () => void;
}

type VideoElementWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: () => void) => number;
};

type FacingMode = "user" | "environment";

const buildConstraints = (facing: FacingMode): MediaTrackConstraints[] => [
  {
    facingMode: { exact: facing },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
  {
    facingMode: facing,
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
  {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
];

const waitForMount = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

const getCameraErrorMessage = (error: unknown) => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
      case "SecurityError":
        return "Camera permission is blocked. Please allow camera access in your browser settings and try again.";
      case "NotFoundError":
      case "DevicesNotFoundError":
        return "No camera was found on this device. Please upload a photo instead.";
      case "NotReadableError":
      case "TrackStartError":
      case "AbortError":
        return "The camera is busy or unavailable right now. Close other apps using the camera and try again.";
      case "OverconstrainedError":
        return "This camera could not be started on your device. Please try again or use Upload Photo instead.";
      default:
        return "The camera could not be started. Please try again or use Upload Photo instead.";
    }
  }
  return "The camera could not be started. Please try again or use Upload Photo instead.";
};

const CameraScanner = ({ open, onClose, onCapture, onUseUploadFallback }: CameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef(0);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearVideoElement = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    sessionRef.current += 1;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    clearVideoElement();
  }, [clearVideoElement]);

  const ensureVideoPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video) throw new Error("Camera preview is not ready yet.");

    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("muted", "true");
    video.setAttribute("autoplay", "true");
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      await new Promise<void>((resolve, reject) => {
        const handleLoaded = () => { cleanup(); resolve(); };
        const handleError = () => { cleanup(); reject(new Error("Camera preview failed to load.")); };
        const cleanup = () => {
          video.removeEventListener("loadedmetadata", handleLoaded);
          video.removeEventListener("error", handleError);
        };
        video.addEventListener("loadedmetadata", handleLoaded, { once: true });
        video.addEventListener("error", handleError, { once: true });
      });
    }

    await video.play();
  }, []);

  const startCamera = useCallback(async (facing: FacingMode) => {
    if (!open) return;

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser does not support camera access. Please use Upload Photo instead.");
      setIsInitializing(false);
      setIsReady(false);
      return;
    }

    const sessionId = sessionRef.current + 1;
    sessionRef.current = sessionId;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    clearVideoElement();
    setError(null);
    setPlaybackBlocked(false);
    setIsReady(false);
    setIsInitializing(true);

    await waitForMount();

    const video = videoRef.current;
    if (!video || sessionRef.current !== sessionId) return;

    const constraints = buildConstraints(facing);
    let lastError: unknown = null;

    for (const constraint of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: constraint, audio: false });

        if (sessionRef.current !== sessionId) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        video.srcObject = stream;

        try {
          await ensureVideoPlayback();
          if (sessionRef.current !== sessionId) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          setIsReady(true);
          setIsInitializing(false);
          return;
        } catch {
          if (sessionRef.current !== sessionId) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          setPlaybackBlocked(true);
          setIsInitializing(false);
          return;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (sessionRef.current !== sessionId) return;

    setError(getCameraErrorMessage(lastError));
    setIsInitializing(false);
    setIsReady(false);
    stopStream();
  }, [clearVideoElement, ensureVideoPlayback, open, stopStream]);

  useEffect(() => {
    if (!open) {
      stopStream();
      setIsInitializing(false);
      setIsReady(false);
      setIsCapturing(false);
      setPlaybackBlocked(false);
      setError(null);
      return;
    }

    void startCamera(facingMode);

    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, facingMode]);

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleManualPlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    setError(null);
    try {
      await video.play();
      setPlaybackBlocked(false);
      setIsReady(true);
    } catch {
      setError("Browser blocked the live preview. Please try again or use Upload Photo instead.");
    }
  };

  const waitForFrame = (video: HTMLVideoElement) =>
    new Promise<void>((resolve) => {
      const frameAwareVideo = video as VideoElementWithFrameCallback;
      if (frameAwareVideo.requestVideoFrameCallback) {
        frameAwareVideo.requestVideoFrameCallback(() => resolve());
        return;
      }
      requestAnimationFrame(() => resolve());
    });

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video || !isReady) {
      setError("The camera is still starting. Please wait a moment and try again.");
      return;
    }
    if (!video.videoWidth || !video.videoHeight) {
      setError("The camera preview is not ready yet. Please try again in a second.");
      return;
    }

    setIsCapturing(true);
    setError(null);

    try {
      await waitForFrame(video);

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not access the capture canvas.");

      // Mirror the image when using front camera for a natural selfie look
      if (facingMode === "user") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });

      if (!blob) throw new Error("Could not create the photo file.");

      const file = new File([blob], `scan-${Date.now()}.jpg`, { type: "image/jpeg" });
      onCapture(file);
      stopStream();
      onClose();
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : "Photo capture failed. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetry = () => {
    void startCamera(facingMode);
  };

  const handleUploadFallback = () => {
    stopStream();
    onUseUploadFallback();
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Scan Your Face</h2>
            <p className="text-sm text-muted-foreground">
              {facingMode === "user" ? "Front" : "Back"} camera · Tap flip to switch
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={handleClose} aria-label="Close scanner">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative flex-1 overflow-hidden bg-muted">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full bg-black object-cover${facingMode === "user" ? " scale-x-[-1]" : ""}`}
          />

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/60" />
            <div className="absolute left-1/2 top-1/2 h-[52vh] max-h-[420px] w-[78vw] max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-[999px] border-2 border-primary/70" />
          </div>

          {/* Flip camera button overlay */}
          {isReady && !isInitializing && (
            <button
              type="button"
              onClick={handleFlipCamera}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-colors hover:bg-background/90"
              aria-label="Switch camera"
            >
              <SwitchCamera className="h-5 w-5" />
            </button>
          )}

          {isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 px-6 text-center backdrop-blur-sm">
              <Loader2 className="h-9 w-9 animate-spin text-primary" />
              <div>
                <p className="font-medium text-foreground">Starting camera…</p>
                <p className="text-sm text-muted-foreground">This may take a moment on some devices.</p>
              </div>
            </div>
          )}

          {playbackBlocked && !isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 px-6 text-center backdrop-blur-sm">
              <Camera className="h-9 w-9 text-primary" />
              <div>
                <p className="font-medium text-foreground">Tap start camera to continue</p>
                <p className="text-sm text-muted-foreground">Some browsers require one extra tap before the live preview can play.</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-border px-4 py-4">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-foreground">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            {playbackBlocked ? (
              <Button type="button" className="gradient-bg border-0 text-primary-foreground gap-2" onClick={handleManualPlay}>
                <Camera className="h-4 w-4" />
                Start Camera
              </Button>
            ) : (
              <Button
                type="button"
                className="gradient-bg border-0 text-primary-foreground gap-2"
                onClick={handleCapture}
                disabled={!isReady || isInitializing || isCapturing}
              >
                <Camera className="h-4 w-4" />
                {isCapturing ? "Capturing..." : "Scan Face"}
              </Button>
            )}

            <Button type="button" variant="outline" className="gap-2" onClick={handleFlipCamera} disabled={isInitializing}>
              <SwitchCamera className="h-4 w-4" />
              Flip Camera
            </Button>

            <Button type="button" variant="outline" className="gap-2" onClick={handleRetry}>
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>

            <Button type="button" variant="outline" className="gap-2" onClick={handleUploadFallback}>
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraScanner;
