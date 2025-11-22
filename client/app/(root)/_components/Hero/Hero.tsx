import React from "react";
import { Button } from "../../../ui/shadcn/button";
import Link from "next/link";
import MarketOverview from "../../../ui/my_components/market-table/MarketOverview";

export default function Hero() {
  return (
    <section
      className="relative mx-auto max-w-6xl px-6 pb-24 pt-12 md:pb-32 lg:grid
        lg:grid-cols-2 lg:items-center lg:gap-40 lg:pt-10"
    >
      {/* Left: Text + CTA */}
      <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
        <h1
          className="mt-4 text-balance text-4xl font-bold leading-tight
            md:text-5xl lg:text-6xl"
        >
          Trade hundreds of pairs with institutional-grade controls.
        </h1>
        <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
          Deep liquidity, transparent fees, and risk tooling for Spot &amp;
          Perps — on desktop and mobile.
        </p>
        <div
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row
            lg:justify-start"
        >
          <Button asChild size="lg" className="px-6 text-base">
            <Link href="#link">Create Account</Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="px-6 text-base">
            <Link href="#link">Browse Market</Link>
          </Button>
        </div>
      </div>

      {/* Right: Market Overview */}
      <div className="h-full w-full pt-10">
        <MarketOverview />
      </div>
    </section>
  );
}
