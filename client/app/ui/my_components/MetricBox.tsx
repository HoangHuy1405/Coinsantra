import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricBox({
  label,
  value,
  showTrend = false,
}: {
  label: string;
  value: string;
  showTrend?: boolean;
}) {
  // Determine if value is positive or negative
  const numValue = parseFloat(value.replace(/[^0-9.-]/g, ""));
  const isPositive = numValue >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        "rounded-xl p-4 flex flex-col items-center justify-center border",
        isPositive
          ? "border-emerald-300/40 bg-emerald-100/10"
          : "border-rose-300/40 bg-rose-100/10",
      )}
    >
      <div className="flex items-center gap-2">
        {showTrend && (
          <Icon
            className={cn(
              "w-4 h-4",
              isPositive ? "text-emerald-500" : "text-rose-500",
            )}
          />
        )}
        <span
          className={cn(
            "font-semibold text-lg",
            isPositive ? "text-emerald-500" : "text-rose-500",
          )}
        >
          {value}
        </span>
      </div>
      <span className="text-sm text-muted-foreground text-center mt-1">
        {label}
      </span>
    </div>
  );
}
