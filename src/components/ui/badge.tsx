import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "green" | "blue" | "orange";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-white/[0.06] text-foreground-sub border-white/[0.08]",
  accent: "bg-accent-soft text-accent-mid border-accent-border",
  green: "bg-status-green/10 text-status-green border-status-green/25",
  blue: "bg-status-blue/10 text-status-blue border-status-blue/25",
  orange: "bg-status-orange/10 text-status-orange border-status-orange/25",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
