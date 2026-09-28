import React from "react";
import { Breadcrumbs, BreadcrumbItem, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  badgeText?: string;
  badgeVariant?: "default" | "primary" | "success" | "warning" | "destructive" | "info" | "rls" | "ai";
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  breadcrumbs,
  badgeText,
  badgeVariant = "default",
  actions,
  className,
}) => {
  return (
    <div className={cn("space-y-3 pb-5 border-b border-slate-200/80 dark:border-slate-800/80", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} className="mb-1" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            {icon && (
              <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 shrink-0 shadow-2xs">
                {icon}
              </span>
            )}
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h1>
            {badgeText && (
              <Badge variant={badgeVariant} size="sm">
                {badgeText}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center space-x-2.5 shrink-0 self-start sm:self-center">{actions}</div>}
      </div>
    </div>
  );
};
