import { useState, useCallback, useRef } from "react";
import { Camera, Upload, X, ImagePlus, Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import ImageCropper from "@/components/ImageCropper";
import CameraScanner from "@/components/CameraScanner";

interface PhotoUploaderProps {
  onPhotoSelected: (file?: File) => void;
}

const PhotoUploader = ({ onPhotoSelected }: PhotoUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const isMobile = useIsMobile();

  const isImageFile = (file: File) => {
    if (file.type.startsWith("image/")) return true;
    return /\.(png|jpe?g|webp|gif|bmp|heic|heif)$/i.test(file.name);
  };

  const handleFile = useCallback(
    (file: File) => {
      if (!isImageFile(file)) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        setRawImageSrc(dataUrl);
      };
      reader.readAsDataURL(file);
      onPhotoSelected(file);
    },
    [onPhotoSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const openFilePicker = () => uploadInputRef.current?.click();
  const openScanner = () => setScannerOpen(true);
  const openUploadFallback = () => {
    setScannerOpen(false);
    uploadInputRef.current?.click();
  };

  const clearPreview = () => {
    setPreview(null);
    setRawImageSrc(null);
    onPhotoSelected(undefined);
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleCropComplete = (croppedFile: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(croppedFile);
    onPhotoSelected(croppedFile);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden border border-border shadow-lg"
          >
            <img src={preview} alt="Preview" className="w-full aspect-square object-cover" />
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => rawImageSrc && setCropperOpen(true)}
                className="w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
                title="Crop photo"
              >
                <Crop className="w-4 h-4" />
              </button>
              <button
                onClick={clearPreview}
                className="w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed transition-all ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <div className="w-16 h-16 rounded-2xl gradient-bg-subtle flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-foreground">
                {isMobile ? "Take a selfie or upload" : "Drop your selfie here"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isMobile ? "Choose an option below" : "or click to browse"}
              </p>
            </div>

            <div className="flex gap-3">
              {isMobile && (
                <Button
                  variant="default"
                  size="lg"
                  className="gap-2 gradient-bg border-0 text-primary-foreground text-base px-6 py-3 min-h-[48px]"
                  type="button"
                  onClick={openScanner}
                >
                  <Camera className="w-5 h-5" />
                  Scan Face
                </Button>
              )}
              <Button
                variant="outline"
                size={isMobile ? "lg" : "default"}
                className={isMobile ? "gap-2 text-base px-6 py-3 min-h-[48px]" : "gap-2"}
                type="button"
                onClick={openFilePicker}
              >
                {isMobile ? <ImagePlus className="w-5 h-5" /> : <Upload className="w-4 h-4" />}
                {isMobile ? "Upload Photo" : "Choose Photo"}
              </Button>
            </div>

            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onClick={(e) => {
                e.currentTarget.value = "";
              }}
              onChange={handleInputChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {rawImageSrc && (
        <ImageCropper
          imageSrc={rawImageSrc}
          open={cropperOpen}
          onClose={() => setCropperOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}

      <CameraScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCapture={handleFile}
        onUseUploadFallback={openUploadFallback}
      />
    </div>
  );
};

export default PhotoUploader;
