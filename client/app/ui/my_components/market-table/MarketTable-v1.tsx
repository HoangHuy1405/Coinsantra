"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Info, TrendingUp } from "lucide-react";
import { Button } from "@/app/ui/shadcn/button";
import { useLiveMarketStream } from "@/hooks/ws/useLiveMarketStream";
import { MarketSparkline } from "../charts/MarketSparkline";
import { COIN_LOGOS } from "../../../../services/constants/coinConstant";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../data-table/data-table";
import { useMemo } from "react";

interface MarketRow {
  symbol: string;
  price: number;
  changePercent: number;
  history?: number[];
}

interface MarketTableProps {
  symbols: string[];
  showLimit?: number;
  enableChart?: boolean;
  enableActions?: boolean;
  enableSorting?: boolean;
  enableSearch?: boolean;
  enablePagination?: boolean;
}

export function MarketTable({
  symbols,
  showLimit,
  enableChart = false,
  enableActions = true,
  enableSorting = true,
  enableSearch = true,
  enablePagination = true,
}: MarketTableProps) {
  const tickers = useLiveMarketStream(symbols);

  // convert live data to a clean array
  const list = useMemo(() => {
    return Object.values(tickers)
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
      .slice(0, showLimit ?? symbols.length);
  }, [tickers, showLimit, symbols]);

  // Define DataTable columns
  const columns: ColumnDef<MarketRow>[] = [
    {
      header: "Coin",
      accessorKey: "symbol",
      cell: ({ row }) => {
        const symbol = row.original.symbol.toUpperCase();
        return (
          <div className="flex items-center gap-3 px-2 py-1">
            <Image
              src={
                COIN_LOGOS[symbol] ??
                `https://ui-avatars.com/api/?name=${symbol}`
              }
              alt={symbol}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="font-medium">{symbol}</span>
          </div>
        );
      },
    },
    {
      header: "Price (USDT)",
      accessorKey: "price",
      sortingFn: "basic",
      cell: ({ getValue }) => {
        const price = getValue<number>();
        return (
          <span className="font-semibold">
            ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      header: "Change (24h)",
      accessorKey: "changePercent",
      sortingFn: "basic",
      cell: ({ getValue }) => {
        const change = getValue<number>();
        const isPositive = change >= 0;
        return (
          <div
            className={`flex items-center gap-1 font-medium ${isPositive ? "text-green-500" : "text-red-500"
              }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {change.toFixed(2)}%
          </div>
        );
      },
    },
  ];

  // Optional sparkline chart column
  if (enableChart) {
    columns.push({
      id: "chart",
      header: "Chart",
      cell: ({ row }) => (
        <div className="w-32">
          <MarketSparkline
            data={row.original.history ?? []}
            isPositive={row.original.changePercent >= 0}
          />
        </div>
      ),
    });
  }

  // Optional action buttons (now icon buttons linking to market/[coin])
  if (enableActions) {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const symbol = row.original.symbol.toLowerCase();
        return (
          <div className="flex items-start gap-2 pr-6">
            {/* Details icon */}
            <Link href={`/market/${symbol}`}>
              <Button variant="ghost" size="icon" title="Details">
                <Info className="w-4 h-4" />
              </Button>
            </Link>
            {/* Trade icon */}
            <Link href={`/market/${symbol}/trade`}>
              <Button variant="ghost" size="icon" title="Trade">
                <TrendingUp className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        );
      },
    });
  }

  return (
    <DataTable
      title="Live Market"
      columns={columns}
      data={list}
      enableSorting={enableSorting}
      enableSearch={enableSearch}
      enablePagination={enablePagination}
      fallback="loading live market ...."
    />
  );
}
