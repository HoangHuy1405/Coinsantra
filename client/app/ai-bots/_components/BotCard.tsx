import { Badge } from "@/app/ui/shadcn/badge";
import { Button } from "@/app/ui/shadcn/button";
import { Card } from "@/app/ui/shadcn/card";
import { Users, Copy } from "lucide-react";

// Priority type: determines which metric should be highlighted
// "roi" → ROI becomes the main large metric
// "pnl" → PnL becomes the main large metric
export type MetricPriority = "roi" | "pnl";
export type timeSlot = "1d" | "7d" | "30d" | "all";

interface BotCardProps {
  id: string;
  name: string;
  roi1d: number;
  roi7d: number;
  roi30d: number;
  roiAllTime: number;
  pnl1d: number;
  pnl7d: number;
  pnl30d: number;
  maxDrawdown: number;
  assets: string[];
  activeUsers: number;
  onCopy: (id: string) => void;
  onClick: (id: string) => void;
  timeWindow: timeSlot;
  priority?: MetricPriority; // NEW
}

export function BotCard({
  id,
  name,
  roi1d,
  roi7d,
  roi30d,
  roiAllTime,
  pnl1d,
  pnl7d,
  pnl30d,
  maxDrawdown,
  assets,
  activeUsers,
  onCopy,
  onClick,
  timeWindow,
  priority = "roi", // default sort priority
}: BotCardProps) {
  // Select ROI and PnL based on selected time range
  const getMetrics = () => {
    switch (timeWindow) {
      case "1d":
        return { roi: roi1d, pnl: pnl1d, label: "24H" };
      case "7d":
        return { roi: roi7d, pnl: pnl7d, label: "7D" };
      case "30d":
        return { roi: roi30d, pnl: pnl30d, label: "30D" };
      case "all":
        return { roi: roiAllTime, pnl: pnl7d, label: "All-Time" };
      default:
        return { roi: roi7d, pnl: pnl7d, label: "7D" };
    }
  };

  const { roi, pnl, label } = getMetrics();

  const mainMetric = priority === "roi" ? roi : pnl;
  const mainMetricLabel =
    priority === "roi" ? `ROI (${label})` : `PnL (${label})`;
  const mainMetricFormatted =
    priority === "roi"
      ? `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`
      : `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`;

  return (
    <Card
      className="group cursor-pointer overflow-hidden border border-border
        bg-card p-5 transition-all hover:-translate-y-1
        hover:shadow-[var(--shadow-lg)] hover:border-[var(--primary)]"
      onClick={() => onClick(id)}
    >
      {/* Header */}
      <div className="mb-4 flex justify-between">
        <div>
          <h3 className="mb-2 text-lg font-semibold">{name}</h3>
          <div
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Users className="h-3.5 w-3.5" />
            <span>{activeUsers.toLocaleString()} users copying this bot</span>
          </div>
        </div>
        {/* Copy Button */}
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onCopy(id);
          }}
          className="p-2"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
      </div>

      {/* MAIN METRIC (Priority-based) */}
      <div className="mb-4 space-y-3">
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="mb-1 text-xs text-muted-foreground">
            {mainMetricLabel}
          </p>
          <p
            className={`text-3xl font-bold ${
              mainMetric >= 0
                ? "text-[var(--chart-3)]"
                : "text-[var(--destructive)]"
              }`}
          >
            {mainMetricFormatted}
          </p>
        </div>

        {/* SECONDARY METRIC (Opposite of priority) */}
        <div className="grid grid-cols-2 gap-2">
          {priority === "roi" ? (
            <div className="rounded-lg border border-border bg-muted/30 p-2.5">
              <p className="mb-1 text-xs text-muted-foreground">
                PnL ({label})
              </p>
              <p
                className={`${
                  pnl >= 0
                    ? "text-[var(--chart-3)]"
                    : "text-[var(--destructive)]"
                  }`}
              >
                {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted/30 p-2.5">
              <p className="mb-1 text-xs text-muted-foreground">
                ROI ({label})
              </p>
              <p
                className={`${
                  roi >= 0
                    ? "text-[var(--chart-3)]"
                    : "text-[var(--destructive)]"
                  }`}
              >
                {roi >= 0 ? "+" : ""}
                {roi.toFixed(2)}%
              </p>
            </div>
          )}

          {/* Max Drawdown */}
          <div className="rounded-lg border border-border bg-muted/30 p-2.5">
            <p className="mb-1 text-xs text-muted-foreground">Max DD</p>
            <p className="text-[var(--destructive)]">
              {maxDrawdown.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* ROI Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="mb-1 text-muted-foreground">1D</p>
            <p
              className={
                roi1d >= 0
                  ? "text-[var(--chart-3)]"
                  : "text-[var(--destructive)]"
              }
            >
              {roi1d >= 0 ? "+" : ""}
              {roi1d.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="mb-1 text-muted-foreground">7D</p>
            <p
              className={
                roi7d >= 0
                  ? "text-[var(--chart-3)]"
                  : "text-[var(--destructive)]"
              }
            >
              {roi7d >= 0 ? "+" : ""}
              {roi7d.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="mb-1 text-muted-foreground">30D</p>
            <p
              className={
                roi30d >= 0
                  ? "text-[var(--chart-3)]"
                  : "text-[var(--destructive)]"
              }
            >
              {roi30d >= 0 ? "+" : ""}
              {roi30d.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Assets */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {assets.map((asset) => (
          <Badge
            key={asset}
            variant="outline"
            className="rounded-full border-border bg-accent/50 text-xs"
          >
            {asset}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
