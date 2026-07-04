import * as React from "react";
import { cn } from "../utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-text-muted select-none flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={id}
            className={cn(
              "flex h-10 w-full rounded-md border border-border bg-background-card px-3 py-2 text-sm text-text-primary transition-all placeholder:text-text-muted/50 focus:border-gold/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-red focus:border-red/50",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-text-muted select-none flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-text-muted/70">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
