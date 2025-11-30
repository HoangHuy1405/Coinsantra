"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/app/ui/shadcn/card";
import { Button } from "@/app/ui/shadcn/button";
import { Switch } from "@/app/ui/shadcn/switch";
import { Label } from "@/app/ui/shadcn/label";
import { Badge } from "@/app/ui/shadcn/badge";
import { Bot, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function AITradeStatus() {
  const router = useRouter();
  const [aiEnabled, setAiEnabled] = useState(true);

  const todayPnL = 3.2;
  const weekPnL = 24.8;
  const isPositiveToday = todayPnL >= 0;
  const isPositiveWeek = weekPnL >= 0;

  function navigateToMyBot() {
    router.push("/my/wallet/ai-bots");
  }

  return (
    <Card className="w-full h-full border border-border shadow-sm bg-card">
      {/* ---------- HEADER ---------- */}
      <CardHeader
        className="flex flex-row flex-wrap items-center justify-between gap-3
          max-[1000px]:flex-col max-[1000px]:items-start"
      >
        {/* Left side: Icon + Title */}
        <div
          className="flex items-center gap-3 w-full
            max-[1000px]:justify-between"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full
              bg-primary/10 shrink-0"
          >
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <CardTitle className="text-base font-semibold">AI Trade</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Automated trading assistant
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* ---------- CONTENT ---------- */}
      <CardContent className="space-y-5">
        {/* Profit Overview (Hidden when <1000px) */}
        <div className="grid grid-cols-2 gap-4 max-[1000px]:hidden">
          {/* Today */}
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Today's PnL</p>
            <div className="mt-1 flex items-center gap-2">
              {isPositiveToday ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-rose-500" />
              )}
              <p
                className={cn(
                  "font-medium",
                  isPositiveToday ? "text-emerald-500" : "text-rose-500",
                )}
              >
                {isPositiveToday ? "+" : ""}
                {todayPnL.toFixed(2)} USDT
              </p>
            </div>
          </div>

          {/* Weekly */}
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Weekly PnL</p>
            <div className="mt-1 flex items-center gap-2">
              {isPositiveWeek ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-rose-500" />
              )}
              <p
                className={cn(
                  "font-medium",
                  isPositiveWeek ? "text-emerald-500" : "text-rose-500",
                )}
              >
                {isPositiveWeek ? "+" : ""}
                {weekPnL.toFixed(2)} USDT
              </p>
            </div>
          </div>
        </div>

        {/* Active Strategies */}
        <div className="rounded-xl border bg-muted/30 p-4">
          <div
            className="flex flex-col md:flex-row md:items-center
              md:justify-between gap-3"
          >
            <div>
              <p className="text-sm font-medium">Active Strategies</p>
              <p className="text-xs text-muted-foreground">3 bots running</p>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "px-2 py-0.5 text-xs font-medium w-fit",
                aiEnabled
                  ? "bg-emerald-500/20 text-emerald-600"
                  : "bg-rose-500/20 text-rose-600",
              )}
            >
              {aiEnabled ? "Active" : "Paused"}
            </Badge>
          </div>
        </div>

        {/* Button */}
        <Button
          variant="outline"
          className="w-full hover:bg-primary/10 transition-colors"
          onClick={navigateToMyBot}
        >
          Configure AI Trade
        </Button>
      </CardContent>
    </Card>
  );
}
