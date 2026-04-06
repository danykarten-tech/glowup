import { useSignedUrl } from "@/hooks/useSignedUrl";

interface SignedImageProps {
  storagePath: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

const SignedImage = ({ storagePath, alt, className, fallback }: SignedImageProps) => {
  const url = useSignedUrl(storagePath);

  if (!url) return fallback ? <>{fallback}</> : null;

  return <img src={url} alt={alt} className={className} />;
};

export default SignedImage;
