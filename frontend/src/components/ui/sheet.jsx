import React from "react";
import { cn } from "@/lib/utils";

const Sheet = ({ children, open, onOpenChange }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
};

const SheetContent = React.forwardRef(({ className, side = "right", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out",
      side === "right" && "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
      side === "left" && "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};