import React from "react";
import { cn } from "@/lib/utils";

// 1. Sparkline Chart
export interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = "#6366f1",
  height = 36,
  className,
}) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      style={{ height, width }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

// 2. Bar Chart
export interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 140, className }) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("w-full flex items-end space-x-2 pt-6", className)} style={{ height }}>
      {data.map((item, idx) => {
        const barHeightPercent = Math.max((item.value / maxVal) * 100, 8);
        return (
          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
            <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
              ${item.value.toLocaleString()}
            </span>
            <div
              className={cn(
                "w-full rounded-t-lg transition-all duration-300 group-hover:brightness-125",
                item.color || "bg-indigo-500"
              )}
              style={{ height: `${barHeightPercent}%` }}
            />
            <span className="text-[10px] font-mono text-slate-400 mt-2 truncate max-w-full">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// 3. Donut Progress Gauge
export interface DonutProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  valueText?: string;
  color?: string;
  className?: string;
}

export const DonutProgress: React.FC<DonutProgressProps> = ({
  percentage,
  size = 110,
  strokeWidth = 10,
  label,
  valueText,
  color = "#10b981",
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-base font-bold text-slate-900 tracking-tight font-mono">
          {valueText || `${percentage}%`}
        </span>
        {label && <span className="text-[10px] uppercase font-mono text-slate-500 font-medium">{label}</span>}
      </div>
    </div>
  );
};

// 4. Sentiment Gauge (-1.0 to +1.0)
export interface SentimentGaugeProps {
  score: number; // -1.0 to 1.0
  className?: string;
}

export const SentimentGauge: React.FC<SentimentGaugeProps> = ({ score, className }) => {
  const normalized = Math.min(Math.max((score + 1) / 2, 0), 1) * 100; // 0 to 100%

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-mono">Sentiment Score</span>
        <span
          className={cn(
            "font-bold font-mono",
            score > 0.3 ? "text-emerald-600" : score < -0.3 ? "text-rose-600" : "text-amber-600"
          )}
        >
          {score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 border border-slate-200/60 overflow-hidden relative">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            score > 0.3 ? "bg-emerald-500" : score < -0.3 ? "bg-rose-500" : "bg-amber-500"
          )}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
};

