import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "destructive"
    | "info"
    | "outline"
    | "rls"
    | "ai";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    default:
      "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    primary:
      "bg-blue-50 text-blue-700 border-blue-200/70 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    success:
      "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    warning:
      "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    destructive:
      "bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    info:
      "bg-sky-50 text-sky-700 border-sky-200/70 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
    outline:
      "bg-transparent text-slate-600 border-slate-300 dark:text-slate-300 dark:border-slate-700",
    rls:
      "bg-blue-50/70 text-blue-700 border-blue-200/60 font-mono tracking-wider dark:bg-slate-800 dark:text-blue-400 dark:border-blue-700",
    ai:
      "bg-indigo-50 text-indigo-700 border-indigo-200/70 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800",
  };

  const dotColor = {
    default: "bg-slate-500",
    primary: "bg-blue-600",
    success: "bg-emerald-600",
    warning: "bg-amber-600",
    destructive: "bg-rose-600",
    info: "bg-sky-600",
    outline: "bg-slate-500",
    rls: "bg-blue-600",
    ai: "bg-indigo-600",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-md border select-none transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor[variant])} />}
      {children}
    </span>
  );
};
