"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/app/ui/shadcn/card";
import { Button } from "@/app/ui/shadcn/button";
import { Badge } from "@/app/ui/shadcn/badge";
import { Bot, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { BotSubOverview } from "@/services/interfaces/botSubInterfaces";

interface AITradeStatusProps {
  data: BotSubOverview;
}

export default function AITradeStatus({ data }: AITradeStatusProps) {
  const router = useRouter();

  const pnl = data.featuredSubscription?.pnl ?? 0;
  const roi = data.featuredSubscription?.roi ?? 0;
  const isPositivePnL = pnl >= 0;
  const isPositiveRoi = roi >= 0;
  const hasActiveSubscriptions = data.totalActive > 0;

  function navigateToMyBot() {
    router.push("/my/wallet/ai-bots");
  }

  return (
    <Card
      className="w-full h-full border border-border shadow-sm bg-card flex
        flex-col"
    >
      {/* ---------- HEADER ---------- */}
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full
              bg-primary/10 shrink-0"
          >
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <CardTitle className="text-lg font-semibold">
              AI Bot Trading
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground truncate">
              {data.featuredSubscription
                ? data.featuredSubscription.botName
                : "No active subscriptions"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* ---------- CONTENT ---------- */}
      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* Performance Metrics */}
        {data.featuredSubscription ? (
          <div className="space-y-3">
            {/* PnL */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profit/Loss</span>
              <div className="flex items-center gap-2">
                {isPositivePnL ? (
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-500" />
                )}
                <span
                  className={cn(
                    "text-lg font-bold",
                    isPositivePnL ? "text-emerald-600" : "text-rose-600",
                  )}
                >
                  {isPositivePnL ? "+" : ""}
                  {pnl.toFixed(2)}
                </span>
              </div>
            </div>

            {/* ROI */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ROI</span>
              <div className="flex items-center gap-2">
                {isPositiveRoi ? (
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-500" />
                )}
                <span
                  className={cn(
                    "text-lg font-bold",
                    isPositiveRoi ? "text-emerald-600" : "text-rose-600",
                  )}
                >
                  {isPositiveRoi ? "+" : ""}
                  {roi.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Max Drawdown */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Max Drawdown
              </span>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-amber-500" />
                <span className="text-lg font-bold text-amber-600">
                  {data.featuredSubscription.maxDrawdown.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="border-t pt-3 mt-3" />
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              No bot subscriptions
            </p>
          </div>
        )}

        {/* Bot Status Summary */}
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-muted-foreground">Status</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-6 px-2.5 text-sm bg-emerald-500/20
                  text-emerald-600"
              >
                {data.totalActive}
              </Badge>
              <span className="text-sm font-medium text-emerald-600">
                Active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="h-6 px-2.5 text-sm bg-rose-500/20 text-rose-600"
              >
                {data.totalInactive}
              </Badge>
              <span className="text-sm font-medium text-rose-600">
                Inactive
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-auto hover:bg-primary/5 transition-colors"
          onClick={navigateToMyBot}
        >
          Manage Bots
        </Button>
      </CardContent>
    </Card>
  );
}
