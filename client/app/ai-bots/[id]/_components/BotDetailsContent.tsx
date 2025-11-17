"use client";

import {
  Users,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Shield,
  Share,
  Copy,
} from "lucide-react";
import { mockPortfolioPerformance } from "@/entities/mockPortfolioPerformance";
import { Bot } from "@/entities/mockAiBots";
import { Button } from "@/app/ui/shadcn/button";
import { Card } from "@/app/ui/shadcn/card";
import PortfolioPerformanceChart from "@/app/my/dashboard/(admin)/coins/_components/PortfolioPerformanceChart";
import { useRouter } from "next/navigation";

interface BotDetailsContentProps {
  bot: Bot;
}

export default function BotDetailsContent({ bot }: BotDetailsContentProps) {
  const router = useRouter();
  if (!bot) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Bot not found.
      </div>
    );
  }

  const handleBack = () => {
    router.push("/ai-bots");
  };

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Button>

      {/* Header Section */}
      <Card className="border border-border bg-card p-6">
        <div
          className="flex flex-col gap-6 lg:flex-row lg:items-start
            lg:justify-between"
        >
          <div className="flex-1">
            <h1 className="mb-1 text-2xl font-semibold">{bot.name}</h1>
            <p className="mb-4 text-muted-foreground text-sm max-w-xl">
              {bot.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex items-center gap-1.5 rounded-full bg-muted/60
                  px-3 py-1.5 text-xs text-muted-foreground"
              >
                <Users className="h-3.5 w-3.5" />
                <span>{bot.activeUsers.toLocaleString()} active users</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              className="gap-2"
              onClick={() =>
                navigator.clipboard.writeText(window.location.href)
              }
              variant="outline"
            >
              <Share /> Share
            </Button>
            <Button className="gap-2">
              <Copy /> Start Copying
            </Button>
          </div>
        </div>
      </Card>

      {/* Performance Chart */}
      <Card className="border border-border bg-card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Performance Overview</h2>
          <PortfolioPerformanceChart
            data={mockPortfolioPerformance}
            subtitle="performance overview"
          />
        </div>

        {/* Metrics Summary Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricBox
            label="ROI (1D)"
            value={`+${bot.roi1d.toFixed(1)}%`}
            positive
          />
          <MetricBox
            label="ROI (7D)"
            value={`+${bot.roi7d.toFixed(1)}%`}
            positive
          />
          <MetricBox
            label="ROI (30D)"
            value={`+${bot.roi30d.toFixed(1)}%`}
            positive
          />
          <MetricBox
            label="PnL (7D)"
            value={`+$${bot.pnl7d.toFixed(2)}`}
            positive
          />
          <MetricBox
            label="PnL (30D)"
            value={`+$${bot.pnl30d.toFixed(2)}`}
            positive
          />
          <MetricBox
            label="Max Drawdown"
            value={`${bot.maxDrawdown.toFixed(1)}%`}
          />
          {/* <MetricBox label="Win Rate" value={`${bot.winRate.toFixed(1)}%`} />
          <MetricBox label="Sharpe Ratio" value={`${bot.sharpeRatio.toFixed(2)}`} />
          <MetricBox label="Avg Daily Trades" value={`${bot.avgDailyTrades.toFixed(1)}`} /> */}
        </div>
      </Card>

      {/* Strategy Section */}
      <Card className="border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Bot Strategy Overview</h2>
        <p className="mb-6 text-muted-foreground text-sm leading-relaxed">
          {bot.description}
        </p>

        <div className="space-y-6">
          {/* Entry Conditions */}
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-lg font-medium">
              <CheckCircle2 className="h-5 w-5 text-[var(--chart-3)]" />
              Entry Conditions
            </h3>
            <ul className="ml-7 space-y-2 text-muted-foreground text-sm">
              <li>• Multi-timeframe trend confirmation (1H, 4H, 1D)</li>
              <li>• Volume analysis to measure trend strength</li>
              <li>• RSI & MACD alignment with momentum bias</li>
              <li>• Breakout confirmation near key support/resistance</li>
            </ul>
          </div>

          {/* Exit Conditions */}
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-lg font-medium">
              <XCircle className="h-5 w-5 text-[var(--destructive)]" />
              Exit Conditions
            </h3>
            <ul className="ml-7 space-y-2 text-muted-foreground text-sm">
              <li>• Trend reversal signals</li>
              <li>• Dynamic trailing stop-loss triggered</li>
              <li>• Multi-tier profit-taking targets achieved</li>
              <li>• Volume divergence or loss of trend momentum</li>
            </ul>
          </div>

          {/* Risk Logic */}
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-lg font-medium">
              <Shield className="h-5 w-5 text-[var(--chart-2)]" />
              Risk Control Logic
            </h3>
            <ul className="ml-7 space-y-2 text-muted-foreground text-sm">
              <li>• Max 2% risk per trade</li>
              <li>• Daily stop-loss limit of 5%</li>
              <li>• ATR-based volatility position sizing</li>
              <li>• Correlation-adjusted position exposure</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Small metric box component
function MetricBox({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  const color = positive
    ? "text-[var(--chart-3)]"
    : value.includes("-")
      ? "text-[var(--destructive)]"
      : "";

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <p className="text-muted-foreground text-xs flex items-center gap-2">
        {label}
      </p>
      <p className={`mt-2 text-lg font-medium ${color}`}>{value}</p>
    </div>
  );
}
