"use client";

import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info" | "ai" | "default";

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  description?: string;
  type?: ToastType;
  variant?: ToastType;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id"> | string, type?: ToastType) => void;
  toast: (toast: Omit<ToastItem, "id"> | string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (toastOrTitle: Omit<ToastItem, "id"> | string, maybeType?: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toastObj: ToastItem =
      typeof toastOrTitle === "string"
        ? { id, title: toastOrTitle, type: maybeType || "info" }
        : { ...toastOrTitle, id };
    setToasts((prev) => [...prev, toastObj]);
    setTimeout(() => removeToast(id), 5000);
  };

  const toast = (opts: Omit<ToastItem, "id"> | string, maybeType?: ToastType) => {
    showToast(opts, maybeType);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    error: <XCircle className="h-4 w-4 text-rose-400" />,
    info: <Info className="h-4 w-4 text-sky-400" />,
    default: <Info className="h-4 w-4 text-sky-400" />,
    ai: <CheckCircle2 className="h-4 w-4 text-purple-400" />,
  };

  const borderStyles = {
    success: "border-emerald-500/40 bg-emerald-950/20",
    warning: "border-amber-500/40 bg-amber-950/20",
    error: "border-rose-500/40 bg-rose-950/20",
    info: "border-sky-500/40 bg-sky-950/20",
    default: "border-sky-500/40 bg-sky-950/20",
    ai: "border-purple-500/40 bg-purple-950/20",
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, toast, removeToast }}>
      {children}
      {/* Toast Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const type = t.type || t.variant || "info";
          const text = t.message || t.description;
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-start justify-between rounded-xl glass-panel border p-3.5 shadow-2xl backdrop-blur-md",
                "animate-in slide-in-from-bottom-2 duration-200",
                borderStyles[type]
              )}
            >
              <div className="flex items-start space-x-2.5">
                <div className="mt-0.5">{icons[type]}</div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.title}</h4>
                  {text && <p className="text-[11px] text-slate-300 mt-0.5">{text}</p>}
                </div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
