"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscriptionDetail } from "@/hooks/bot/useSubscriptionDetail";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import SubscriptionHeader from "./_components/SubscriptionHeader";
import PerformanceDashboard from "./_components/PerformanceDashboard";
import WalletAllocation from "./_components/WalletAllocation";
import BotConfiguration from "./_components/BotConfiguration";
import { Button } from "@/app/ui/shadcn/button";
import { ArrowLeft } from "lucide-react";
import { useBotSub } from "@/hooks/bot/useBotSub";

export default function MySubscriptionDetail() {
  const router = useRouter();
  const params = useParams();
  const subscriptionId = params.id as string;

  const [timeframe, setTimeframe] = useState<"current" | "1d" | "7d">(
    "current",
  );
  const { data, isLoading, error } = useSubscriptionDetail(
    subscriptionId,
    timeframe,
  );
  const { toggleMutation } = useBotSub();

  const handleBack = () => {
    router.push("/my/wallet/ai-bots");
  };

  const handleToggleBotStatus = (enabled: boolean) => {
    toggleMutation.mutate({ id: subscriptionId, enable: enabled });
    if (enabled) {
      toast.success("Bot started successfully");
    } else {
      toast.error("Bot paused. New trades will not be opened.");
    }
    // TODO: Implement API call to toggle bot status
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Loading subscription details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Subscription Not Found</h2>
        <p className="text-muted-foreground">
          The requested bot subscription could not be loaded.
        </p>
        <Button onClick={handleBack} variant="secondary">
          Go Back
        </Button>
      </div>
    );
  }

  const subscription = data;

  return (
    <div
      className="mx-auto max-w-[1600px] space-y-6 animate-in fade-in
        duration-500"
    >
      <Button
        variant="ghost"
        onClick={handleBack}
        className="gap-2"
        type="button"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bot List
      </Button>
      <SubscriptionHeader
        coin={subscription.coin}
        botName={subscription.botName}
        tradingPair={subscription.tradingPair}
        isActive={subscription.active}
        onToggleStatus={handleToggleBotStatus}
      />

      <PerformanceDashboard
        timeframe={timeframe}
        pnl={subscription.pnl}
        roi={subscription.roi}
        maxDrawdown={subscription.maxDrawdown}
        maxDrawdownPercent={subscription.maxDrawdownPercent}
        chartData={subscription.chartData}
        onTimeframeChange={setTimeframe}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <WalletAllocation
          botWalletBalance={subscription.botWalletBalance}
          botWalletCoin={subscription.botWalletCoin}
          netInvestment={subscription.netInvestment}
          totalEquity={subscription.totalEquity}
          tradingPair={subscription.tradingPair}
        />

        <BotConfiguration
          subscriptionId={subscription.subscriptionId}
          botWalletCoin={subscription.botWalletCoin}
          botWalletBalance={subscription.botWalletBalance}
          tradePercentage={subscription.tradePercentage}
          maxDailyLossPercentage={subscription.maxDailyLossPercentage}
        />
      </div>
    </div>
  );
}
