"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/shadcn/card";
import { COIN_LOGOS } from "@/app/ui/widgets/constant";

export default function TopBox({
  title,
  coins,
}: {
  title: string;
  coins: any[];
}) {
  return (
    <Card className="border border-border bg-card shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {coins.length > 0 ? (
          coins.map((c) => {
            const symbol = c.symbol.toUpperCase();
            const logo =
              COIN_LOGOS[symbol] ??
              `https://ui-avatars.com/api/?name=${encodeURIComponent(symbol)}`;

            return (
              <div
                key={symbol}
                className="flex items-center justify-between text-sm"
              >
                {/* Left: Logo + Symbol */}
                <div className="flex items-center gap-2">
                  <Image
                    src={logo}
                    alt={symbol}
                    width={22}
                    height={22}
                    className="rounded-full"
                  />
                  <span className="font-medium">{symbol}</span>
                </div>

                {/* Middle: Price */}
                <span className="font-semibold text-muted-foreground">
                  $
                  {Number(c.price).toLocaleString(undefined, {
                    maximumFractionDigits: 4,
                  })}
                </span>

                {/* Right: % Change */}
                <span
                  className={`font-semibold ${c.changePercent >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                >
                  {c.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-muted-foreground text-sm">Loading...</div>
        )}
      </CardContent>
    </Card>
  );
}
