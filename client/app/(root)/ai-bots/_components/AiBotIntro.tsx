"use client";

import { AnimatedCounter } from "@/app/ui/my_components/animation/AnimatedCounter";
import Image from "next/image";
import { Button } from "@/app/ui/shadcn/button";
import { useRouter } from "next/navigation";
import robotImgUrl from "@/public/robot.png";

interface AiBotIntroProps {
  totalBots: number;
  activeTraders: number;
  totalValue: number;
}

export default function AiBotIntro({
  totalBots,
  activeTraders,
  totalValue,
}: AiBotIntroProps) {
  const router = useRouter();

  const handleLearnMore = () => {
    router.push("#how-to");
  };

  return (
    <section
      className="mb-20 w-full grid grid-cols-1 md:grid-cols-2 gap-12
        items-center"
    >
      {/* LEFT COLUMN */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
          AI Trading Bots
        </h1>

        <p className="text-muted-foreground max-w-xl mb-8 text-lg">
          Automate your trading with intelligent strategies designed to analyze
          markets, execute trades, and optimize performance. Replicate
          top-performing bots or build your own algorithmic edge.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Total Bots */}
          <div className="text-left">
            <p className="text-sm text-muted-foreground mb-1">Total Bots</p>
            <p className="text-3xl font-bold">
              <AnimatedCounter value={totalBots} duration={2} />
            </p>
          </div>

          {/* Active Traders */}
          <div className="text-left">
            <p className="text-sm text-muted-foreground mb-1">Active Traders</p>
            <p className="text-3xl font-bold">
              <AnimatedCounter value={activeTraders} duration={2.5} />
            </p>
          </div>

          {/* Total Value */}
          <div className="text-left">
            <p className="text-sm text-muted-foreground mb-1">Total Value</p>
            <p className="text-3xl font-bold">
              <AnimatedCounter value={totalValue} prefix="$" duration={3} />
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div
        className="w-full max-w-xl border border-border bg-card/40 p-6
          rounded-2xl shadow-sm"
      >
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center
            md:text-left"
        >
          {/* Left Column */}
          <div
            className="col-span-2 h-full flex flex-col justify-between
              items-center md:items-start p-2"
          >
            <div className="pt-2">
              <h3 className="text-xl font-semibold mb-1">
                Your Smart Trading Partner
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Learn how automated bots?
              </p>
            </div>

            <Button
              className="block w-3/4 sm:w-1/2 md:w-auto px-6 mt-4 bg-secondary
                text-secondary-foreground rounded-lg py-2 mx-auto md:mx-0"
              onClick={handleLearnMore}
              variant="ghost"
            >
              Learn How It Works
            </Button>
          </div>

          {/* Right Column */}
          <div
            className="col-span-1 flex items-center justify-center
              md:justify-end"
          >
            <Image
              src={robotImgUrl}
              width={150}
              height={150}
              alt="AI Bot Icon"
              className="opacity-95"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
