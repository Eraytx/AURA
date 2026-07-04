import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-gold text-[#0D0D0D] hover:bg-gold-hover shadow-[0_0_15px_rgba(212,160,23,0.15)]",
        secondary: "bg-background-card text-text-primary border border-border hover:bg-background-secondary",
        ghost: "text-text-muted hover:text-text-primary hover:bg-background-card",
        danger: "bg-red text-text-primary hover:bg-red-hover shadow-[0_0_15px_rgba(226,75,74,0.15)]",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 width-4 animate-spin text-inherit" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
