import * as React from "react";

import { cn } from "@/lib/utils";

// Add variant prop type
interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "green" | "red" | "skip";
}

function Input({ className, type, variant = "default", ...props }: InputProps) {
  // Define variant classes
  const variantClasses = {
    default: "border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50",
    green:
      "border-green-500 bg-green-500 dark:bg-green-500/20 focus-visible:border-green-600 focus-visible:ring-green-200",
    red: "border-red-500 bg-red-500 dark:bg-red-500/20 focus-visible:border-red-600 focus-visible:ring-red-200",
    skip: "border-white bg-gray-500 dark:bg-gray-300/20 focus-visible:border-gray-600 focus-visible:ring-gray-200",
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        variantClasses[variant],
        "focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
