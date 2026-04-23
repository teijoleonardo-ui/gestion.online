import { cn } from "@/lib/utils";

export type PilLogoProps = {
  className?: string;
};

/** Raster en /public/logos/pil.png */
export function PilLogo({ className }: PilLogoProps) {
  return (
    <span className={cn("inline-flex max-h-full w-full items-center justify-center", className)}>
      <img
        src="/logos/pil.png"
        alt=""
        width={160}
        height={48}
        className="max-h-full w-auto max-w-[92%] object-contain grayscale transition-[filter] duration-300 ease-out group-hover:grayscale-0"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
