import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "glass"
    | "destructive"
    | "ai";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]";

    const variantStyles = {
      default:
        "bg-slate-900 text-white hover:bg-slate-800 shadow-xs border border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white",
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 shadow-xs border border-blue-600 focus:ring-blue-500",
      secondary:
        "bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
      outline:
        "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-2xs dark:bg-transparent dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800",
      ghost:
        "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800",
      glass:
        "bg-white/80 backdrop-blur-sm text-slate-800 hover:bg-white border border-slate-200/80 shadow-2xs",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-xs border border-rose-600",
      ai: "bg-blue-600 text-white hover:bg-blue-700 shadow-xs border border-blue-600",
    };

    const sizeStyles = {
      sm: "h-8 px-2.5 text-xs gap-1.5 rounded-lg",
      md: "h-9 px-3.5 text-xs font-medium gap-2 rounded-lg",
      lg: "h-11 px-5 text-sm font-medium gap-2.5 rounded-lg",
      icon: "h-8 w-8 p-0 items-center justify-center rounded-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
