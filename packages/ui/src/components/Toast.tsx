"use client";

import { Toaster as SonnerToaster, toast } from "sonner";
import * as React from "react";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background-card group-[.toaster]:text-text-primary group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-md font-sans border",
          description: "group-[.toast]:text-text-muted text-xs",
          actionButton:
            "group-[.toast]:bg-gold group-[.toast]:text-[#0D0D0D] group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-background-secondary group-[.toast]:text-text-muted",
          success: "group-[.toast]:border-green/30 group-[.toast]:text-green",
          error: "group-[.toast]:border-red/30 group-[.toast]:text-red",
          info: "group-[.toast]:border-gold/30 group-[.toast]:text-gold",
          warning: "group-[.toast]:border-amber-500/30 group-[.toast]:text-amber-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
