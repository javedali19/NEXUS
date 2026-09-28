import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingProps> = ({ size = "md", text, className }) => {
  const sizeStyles = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={cn("inline-flex flex-col items-center justify-center gap-2", className)}>
      <Loader2 className={cn("animate-spin text-indigo-500", sizeStyles[size])} />
      {text && <span className="text-xs text-slate-400 font-medium">{text}</span>}
    </div>
  );
};

export const LoadingDots: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("inline-flex items-center space-x-1", className)}>
    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
  </div>
);
