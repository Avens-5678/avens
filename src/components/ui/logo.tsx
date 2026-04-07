import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Hide the wordmark/tagline beneath the mark. */
  iconOnly?: boolean;
  /** Image height in pixels. Defaults to 36. */
  size?: number;
}

// Canonical brand mark — drop the file at /public/logo.png and it will
// be served at the root. Used by Navbar, dashboards, emails, quote PDFs,
// and anywhere else the brand appears.
export const LOGO_SRC = "/logo.png";

const Logo = ({ className, iconOnly = false, size = 36 }: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={LOGO_SRC}
        alt="Evnting.com"
        style={{ height: size, width: "auto" }}
        className="object-contain select-none"
        loading="eager"
        decoding="async"
      />
      {!iconOnly && (
        <div className="font-bold leading-tight">
          <span className="text-primary text-xl font-brand font-bold italic uppercase">Evnting.com</span>
          <div className="text-muted-foreground text-[10px] tracking-wide">A Panacea of Events</div>
        </div>
      )}
    </div>
  );
};

export default Logo;