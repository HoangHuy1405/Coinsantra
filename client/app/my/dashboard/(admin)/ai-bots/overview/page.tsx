"use client";

import { useState, useMemo } from "react";
import { Bot, Activity, Users } from "lucide-react";

import { AdminBot, adminBotDatabase } from "@/entities/mockAdminAiBots";
import { StatsCard } from "./_components/StatsCard";
import BotTable from "./_components/BotTable";
import { BotFilterBar } from "./_components/BotFilterBar";
import { BotAction, BotStatus } from "@/services/constants/botConstant";
import { useAllBots } from "@/hooks/bot/useBotHook";
import { BotResponse } from "@/services/interfaces/botInterfaces";

export default function AdminOverview() {
  const [statusFilter, setStatusFilter] = useState<BotStatus | "all">("all");
  const [coinFilter, setCoinFilter] = useState("all");
  const [sortBy, setSortBy] = useState("copying-users");

  // 1. Fetch Real Data
  const { data: bots, isLoading, isError } = useAllBots();

  // 2. Calculate Summary Stats
  const totalBots = bots?.length || 0;
  const activeBots = bots?.filter((b) => b.status === "ACTIVE").length || 0;
  const totalUsers =
    bots?.reduce((sum, b) => sum + (b.stats?.copyingUsers || 0), 0) || 0;

  // 3. Extract Unique Coins for Filter
  const uniqueCoins = useMemo(() => {
    if (!bots) return [];

    const coins = bots
      .map((b) => b.tradingConfig?.coinSymbol)
      .filter((symbol): symbol is string => !!symbol);

    return Array.from(new Set(coins));
  }, [bots]);

  // Filtering + Sorting
  const filteredBots: BotResponse[] = useMemo(() => {
    if (!bots) return [];

    return bots
      .filter((bot) => {
        // Status Filter (Assuming your FilterBar passes "all" or specific status)
        // Note: Check if your FilterBar uses "all" or just ignores it
        const statusMatch =
          statusFilter === "all" || (statusFilter as string) === bot.status;

        // Coin Filter
        const coinMatch =
          coinFilter === "all" || bot.tradingConfig?.coinSymbol === coinFilter;

        return statusMatch && coinMatch;
      })
      .sort((a, b) => {
        // Helper to safely get stats (default to 0)
        const getRoi = (bot: BotResponse) => bot.stats?.roi24h ?? 0;
        const getPnl = (bot: BotResponse) => bot.stats?.pnl24h ?? 0;
        const getUsers = (bot: BotResponse) => bot.stats?.copyingUsers ?? 0;

        switch (sortBy) {
          case "roi-24h":
            return getRoi(b) - getRoi(a);
          case "pnl-24h":
            return getPnl(b) - getPnl(a);
          case "status": {
            // Simple sort: Active first
            const order: Record<string, number> = {
              ACTIVE: 1,
              PAUSED: 2,
              ERROR: 3,
            };
            return (order[a.status] || 99) - (order[b.status] || 99);
          }
          default: // "copying-users"
            return getUsers(b) - getUsers(a);
        }
      });
  }, [bots, statusFilter, coinFilter, sortBy]);

  return (
    <div className="flex flex-col space-y-8 max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage all AI trading bots across the platform
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          label="Total Bots"
          value={totalBots}
          icon={<Bot className="h-6 w-6 text-primary" />}
          accent="bg-primary"
        />
        <StatsCard
          label="Active Bots"
          value={activeBots}
          icon={<Activity className="h-6 w-6 text-[var(--chart-3)]" />}
          accent="bg-[var(--chart-3)]"
        />
        <StatsCard
          label="Total Copying Users"
          value={totalUsers.toLocaleString()}
          icon={<Users className="h-6 w-6 text-[var(--chart-2)]" />}
          accent="bg-[var(--chart-2)]"
        />
      </div>

      <BotFilterBar
        uniqueCoins={uniqueCoins}
        coinFilter={coinFilter}
        statusFilter={statusFilter as any}
        sortBy={sortBy}
        onCoinChange={setCoinFilter}
        onStatusChange={setStatusFilter}
        onSortChange={setSortBy}
      />
      <BotTable bots={filteredBots} />
    </div>
  );
}
