"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/shadcn/card";
import { Tabs, TabsList, TabsTrigger } from "@/app/ui/shadcn/tabs";
import MetricBox from "@/app/ui/my_components/MetricBox";
import PnLLineChart from "@/app/ui/my_components/charts/PnLLineChart";
import { ChartDataPoint } from "@/services/interfaces/botSubInterfaces";

interface PerformanceDashboardProps {
  timeframe: "current" | "1d" | "7d";
  pnl: number;
  roi: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  chartData: ChartDataPoint[];
  onTimeframeChange: (timeframe: "current" | "1d" | "7d") => void;
}

export default function PerformanceDashboard({
  timeframe,
  pnl,
  roi,
  maxDrawdown,
  maxDrawdownPercent,
  chartData,
  onTimeframeChange,
}: PerformanceDashboardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Performance Dashboard
        </CardTitle>
        <Tabs
          value={timeframe}
          onValueChange={(v) => onTimeframeChange(v as any)}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="current">All</TabsTrigger>
            <TabsTrigger value="1d">24H</TabsTrigger>
            <TabsTrigger value="7d">7D</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <MetricBox
            label="Net PnL"
            value={`${pnl >= 0 ? "+" : ""}$${Math.abs(pnl).toFixed(2)}`}
            showTrend={true}
          />
          <MetricBox
            label="ROI"
            value={`${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`}
            showTrend={true}
          />
          <MetricBox
            label="Max Drawdown"
            value={`-$${Math.abs(maxDrawdown).toFixed(2)} (${maxDrawdownPercent.toFixed(2)}%)`}
            showTrend={false}
          />
        </div>

        {/* Chart */}
        <div className="pt-4">
          <PnLLineChart
            chartData={chartData}
            timeframe={timeframe}
            height="300px"
          />
        </div>
      </CardContent>
    </Card>
  );
}
