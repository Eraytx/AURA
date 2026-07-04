import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        high: "bg-red/10 text-red border border-red/20",
        medium: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        low: "bg-green/10 text-green border border-green/20",
        neutral: "bg-background-secondary text-text-muted border border-border",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
