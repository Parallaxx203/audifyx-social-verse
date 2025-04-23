
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  withText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, withText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <span className={cn("font-bold text-audifyx-purple", sizeClasses[size])}>
          🎵
        </span>
      </div>
      {withText && (
        <span className={cn("font-bold text-gradient", sizeClasses[size])}>Audifyx</span>
      )}
    </div>
  );
}
