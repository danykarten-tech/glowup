import logoSrc from "@/assets/facenova-logo.png";

interface FaceNovaLogoProps {
  size?: number;
  className?: string;
}

const FaceNovaLogo = ({ size = 32, className = "" }: FaceNovaLogoProps) => (
  <img
    src={logoSrc}
    alt="FaceNova"
    width={size}
    height={size}
    className={`rounded-lg object-contain ${className}`}
    loading="lazy"
  />
);

export default FaceNovaLogo;
