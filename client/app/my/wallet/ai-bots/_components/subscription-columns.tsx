"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Settings, StopCircle, Play } from "lucide-react";
import { Button } from "@/app/ui/shadcn/button";
import { Badge } from "@/app/ui/shadcn/badge";
import { BotSubscription } from "@/services/interfaces/botSubInterfaces";
import { COIN_LOGOS } from "@/services/constants/coinConstant";
import Image from "next/image";

interface SubscriptionColumnsProps {
  onNavigateToDetail: (subscriptionId: string) => void;
  onToggleSubscription: (
    subscriptionId: string,
    currentStatus: boolean,
  ) => void;
}

export function getSubscriptionColumns({
  onNavigateToDetail,
  onToggleSubscription,
}: SubscriptionColumnsProps): ColumnDef<BotSubscription>[] {
  return [
    {
      accessorKey: "botName",
      header: "Bot Name",
      cell: ({ row }) => {
        const sub = row.original;
        return (
          <div>
            <p className="font-medium">{sub.botName}</p>
            <p className="text-sm text-muted-foreground">{sub.tradingPair}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "coin",
      header: "Asset",
      cell: ({ row }) => {
        const coin = row.original.coin;
        const logoUrl = COIN_LOGOS[coin];
        return (
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={coin}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full
                  bg-primary/10 border border-primary/20"
              >
                <span className="text-primary text-xs font-semibold">
                  {coin}
                </span>
              </div>
            )}
            <span className="font-medium">{coin}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.active;
        return (
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-1 ${
              isActive
                ? `bg-green-500/10 text-green-700 dark:text-green-400
                  border-green-500/20`
                : `bg-red-500/10 text-red-700 dark:text-red-400
                  border-red-500/20`
              }`}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "totalEquity",
      header: "Total Equity",
      cell: ({ row }) => {
        const equity = row.original.totalEquity;
        return (
          <div className="text-left">
            <p className="font-medium">
              $
              {equity.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "pnl",
      header: "Realized PnL",
      cell: ({ row }) => {
        const pnl = row.original.pnl;
        const isPositive = pnl >= 0;
        const absolutePnl = Math.abs(pnl);
        return (
          <div
            className={`font-medium ${
              isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
              }`}
          >
            {isPositive ? "+" : "-"}$
            {absolutePnl.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const sub = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onNavigateToDetail(sub.subscriptionId)}
            >
              <Settings className="h-4 w-4" />
              Manage
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${
                sub.active
                  ? `text-destructive hover:bg-destructive/10
                    hover:text-destructive`
                  : `text-green-600 hover:bg-green-500/10 hover:text-green-600
                    dark:text-green-400`
                }`}
              onClick={() =>
                onToggleSubscription(sub.subscriptionId, sub.active)
              }
            >
              {sub.active ? (
                <StopCircle className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
    },
  ];
}
