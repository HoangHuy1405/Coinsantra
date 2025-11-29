import React from "react";

import MarketTable from "@/app/ui/my_components/market-table/MarketTable";
import { getCachedMarketData } from "@/lib/actions/gecko.actions";

export default async function MarketPage() {
  const initialCoins = await getCachedMarketData(1000);

  // const tickers = useLiveMarketStream(SYMBOLS);

  // // 🧠 Compute top categories
  // const list = Object.values(tickers);

  // const topGainers = useMemo(
  //   () =>
  //     [...list].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3),
  //   [list],
  // );

  // const topVolume = useMemo(
  //   () =>
  //     [...list]
  //       .sort((a, b) => (b.quoteVolume ?? 0) - (a.quoteVolume ?? 0))
  //       .slice(0, 3),
  //   [list],
  // );

  // const newCoins = useMemo(() => list.slice(-3), [list]);
  // const hotCoins = useMemo(() => topGainers.slice(0, 3), [topGainers]);

  return (
    <main className="flex flex-col items-center w-full bg-background">
      {/* Centered content wrapper */}
      <div
        className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10 space-y-10"
      >
        {/* --- Top coin boxes --- */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* <TopBox title="🔥 Hot" coins={hotCoins} />
          <TopBox title="🆕 New" coins={newCoins} />
          <TopBox title="📈 Top Gainers" coins={topGainers} />
          <TopBox title="💰 Top Volume" coins={topVolume} /> */}
        </section>

        {/* --- Market Table --- */}
        <MarketTable initialData={initialCoins}
        />
      </div>
    </main>
  );
}
