import { cn } from "@/lib/utils";

export type AmiLogoProps = {
  className?: string;
};

/** Raster en /public/logos/ami.png */
export function AmiLogo({ className }: AmiLogoProps) {
  return (
    <span className={cn("inline-flex max-h-full w-full items-center justify-center", className)}>
      <img
        src="/logos/ami.png"
        alt=""
        width={180}
        height={48}
        className="max-h-full w-auto max-w-[92%] object-contain grayscale transition-[filter] duration-300 ease-out group-hover:grayscale-0"
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
