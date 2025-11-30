"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/shadcn/card";
import { Input } from "@/app/ui/shadcn/input";
import { Label } from "@/app/ui/shadcn/label";

interface WalletAllocationProps {
  botWalletBalance: number;
  botWalletCoin: number;
  netInvestment: number;
  totalEquity: number;
  tradingPair: string;
}

export default function WalletAllocation({
  botWalletBalance,
  botWalletCoin,
  netInvestment,
  totalEquity,
  tradingPair,
}: WalletAllocationProps) {
  // Extract symbols from the trading pair (e.g., "BTC/USDT" -> ["BTC", "USDT"])
  // Fallback to ["Base", "Quote"] if format is unexpected
  const [baseSymbol, quoteSymbol] = tradingPair.includes("/")
    ? tradingPair.split("/")
    : ["BASE", "QUOTE"];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Wallet Allocation</CardTitle>
        <p className="text-sm text-muted-foreground">
          Virtual balance allocated from your main wallet for this bot
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Bot Wallet */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Current Bot Wallet</h3>
          <div className="grid gap-4 rounded-lg border bg-muted/30 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Coin Balance</p>
                <p className="text-base font-semibold">
                  {botWalletBalance.toFixed(8)} ({quoteSymbol})
                </p>
                <p className="text-base font-semibold">
                  {botWalletCoin} ({baseSymbol})
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Current Equity (with P&L)
                </p>
                <p className="text-lg font-bold">
                  $
                  {totalEquity.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  USD Value (Initial)
                </p>
                <p className="text-lg font-bold">
                  $
                  {netInvestment.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3
            text-xs text-blue-600 dark:text-blue-400"
        >
          <strong>Note:</strong> This is a virtual allocation from your main
          wallet. Profits and losses are reflected in both the bot wallet and
          your main wallet balance.
        </div>
      </CardContent>
    </Card>
  );
}
