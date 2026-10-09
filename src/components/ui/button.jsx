import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";

export const Button = forwardRef(function Button({ asChild = false, className = "", type = "button", ...props }, ref) {
  const Component = asChild ? Slot : "button";
  return <Component ref={ref} {...(!asChild ? { type } : {})} className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 ${className}`} {...props} />;
});
