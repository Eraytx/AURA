import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../utils";

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string;
  alt?: string;
  fallback?: string;
  online?: boolean;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, src, alt, fallback, online = false, ...props }, ref) => (
  <div className="relative inline-block">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-background-card",
        className
      )}
      {...props}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={alt}
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center rounded-full bg-background-secondary text-sm font-semibold text-text-primary uppercase"
      >
        {fallback || "U"}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
    {online && (
      <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green ring-2 ring-[#0D0D0D]" />
    )}
  </div>
));
Avatar.displayName = "Avatar";

export { Avatar };
