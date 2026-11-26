import { BRAND_CONFIG } from '../config';

interface BrandLogoProps {
  size?: number;
}

export function BrandLogo({ size = 30 }: BrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Flat 2D geometric dual-layer cutout mark */}
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        fill={BRAND_CONFIG.slateColor}
      />
      <rect
        x="11"
        y="11"
        width="18"
        height="18"
        rx="4"
        fill={BRAND_CONFIG.accentColor}
      />
      <rect
        x="11"
        y="11"
        width="10"
        height="10"
        rx="2"
        fill="#FFFFFF"
      />
    </svg>
  );
}
