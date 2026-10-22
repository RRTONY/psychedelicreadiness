import Image from "next/image";

// Shared "full-bleed real photo fading into the section background" band
// used throughout this page — extracted to avoid repeating the same markup
// 8 times. Legacy layered a decorative repeating-gradient "scanline"
// texture div over every one of these; dropped as pure decoration (same
// call made for glitch/VHS effects elsewhere in this migration), the real
// photo and gradient fade are kept.
export function CinematicBand({
  src,
  alt,
  fadeTo,
  heightClass = "h-[clamp(180px,25vw,320px)]",
  objectPosition = "object-center",
  className = "",
}: {
  src: string;
  alt: string;
  fadeTo: "cream" | "ink";
  heightClass?: string;
  objectPosition?: string;
  className?: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden ${heightClass} ${className}`}>
      <Image src={src} alt={alt} fill sizes="100vw" className={`object-cover ${objectPosition}`} />
      <div className={`absolute inset-0 bg-linear-to-b from-transparent ${fadeTo === "cream" ? "to-pri-cream" : "to-pri-ink"}`} />
    </div>
  );
}
