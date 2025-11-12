"use client";

import Image from "next/image";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/app/ui/shadcn/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/app/ui/shadcn/table";
import { useLiveMarketStream } from "@/hooks/ws/useLiveMarketStream";
import { MarketSparkline } from "../my_components/charts/MarketSparkline";
import { COIN_LOGOS } from "./constant";

interface MarketTableProps {
  symbols: string[];
  showLimit?: number;
  showChart?: false;
  showActions?: boolean;
}

export function MarketTable({
  symbols,
  showLimit,
  showChart = false,
  showActions = true,
}: MarketTableProps) {
  const tickers = useLiveMarketStream(symbols);
  const list = Object.values(tickers)
    .sort((a, b) => a.symbol.localeCompare(b.symbol))
    .slice(0, showLimit ?? symbols.length);

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-card
        shadow-sm h-full"
    >
      <div
        className="flex items-center justify-between p-4 border-b
          border-border/50"
      >
        <h1 className="text-lg font-semibold px-2">Live Market</h1>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-full text-sm">
          <TableHeader>
            <TableRow className="bg-muted/30 text-muted-foreground">
              <TableHead className="px-8 py-3">Coin</TableHead>
              <TableHead>Price (USDT)</TableHead>
              <TableHead>Change (24h)</TableHead>
              {showChart && <TableHead>Chart</TableHead>}
              {showActions && (
                <TableHead className="text-right px-8">Action</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {list.length > 0 ? (
              list.map((t) => {
                const isPositive = t.changePercent >= 0;
                return (
                  <TableRow key={t.symbol} className="hover:bg-muted/20">
                    {/* Coin */}
                    <TableCell className="px-8 py-3 flex items-center gap-3">
                      <Image
                        src={
                          COIN_LOGOS[t.symbol.toUpperCase()] ??
                          "https://via.placeholder.com/24"
                        }
                        alt={t.symbol}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <div className="font-medium">{t.symbol}</div>
                    </TableCell>

                    {/* Price */}
                    <TableCell className="font-semibold">
                      $
                      {t.price.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>

                    {/* Change */}
                    <TableCell
                      className={`font-medium flex items-center gap-1 ${
                        isPositive ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {t.changePercent.toFixed(2)}%
                    </TableCell>

                    {/* Sparkline */}
                    {showChart && (
                      <TableCell className="w-32">
                        <MarketSparkline
                          data={t.history}
                          isPositive={isPositive}
                        />
                      </TableCell>
                    )}

                    {/* Action */}
                    {showActions && (
                      <TableCell className="text-right pr-6">
                        <Button variant="outline" size="sm">
                          Trade
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 5 : 4}
                  className="text-center text-muted-foreground py-8"
                >
                  Connecting to live market data...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
