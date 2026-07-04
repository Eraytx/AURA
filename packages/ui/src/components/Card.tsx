import * as React from "react";
import { cn } from "../utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glass?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = true, glass = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-border bg-background-card p-5 text-text-primary transition-all",
          hoverEffect && "hover:border-gold/30 hover:shadow-[0_0_20px_rgba(212,160,23,0.03)]",
          glass && "bg-opacity-40 backdrop-blur-md",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card };
