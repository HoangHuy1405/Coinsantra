"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/app/ui/my_components/data-table/data-table";
import { useUserSubscriptions } from "@/hooks/bot/useUserSubscriptions";
import { getSubscriptionColumns } from "./_components/subscription-columns";
import { Button } from "@/app/ui/shadcn/button";
import { Bot } from "lucide-react";
import { useBotSub } from "@/hooks/bot/useBotSub";
import toast from "react-hot-toast";

export default function MySubscriptionsList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"pnl" | "equity" | "bot">("pnl");
  const { toggleMutation } = useBotSub();

  // Fetch subscriptions
  const { data, isLoading, error } = useUserSubscriptions({
    page,
    size: 10,
    sortBy,
  });

  // Handle navigation to detail page
  const handleNavigateToDetail = (subscriptionId: string) => {
    router.push(`/my/wallet/ai-bots/${subscriptionId}`);
  };

  // Handle toggle subscription
  const handleToggleSubscription = (
    subscriptionId: string,
    currentStatus: boolean,
  ) => {
    toggleMutation.mutate({ id: subscriptionId, enable: !currentStatus });
  };

  // Define columns
  const columns = useMemo(
    () =>
      getSubscriptionColumns({
        onNavigateToDetail: handleNavigateToDetail,
        onToggleSubscription: handleToggleSubscription,
      }),
    [],
  );

  if (error) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="text-center text-red-500">
          Error loading subscriptions: {error.message}
        </div>
      </div>
    );
  }

  // Empty state when no subscriptions
  if (!isLoading && (!data?.result || data.result.length === 0)) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Active Bots</h1>
            <p className="text-muted-foreground">
              Manage your subscribed trading bots and monitor performance
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div
          className="flex flex-col items-center justify-center py-16 px-4 border
            rounded-lg bg-muted/20"
        >
          <Bot className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Active Bots Yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            You haven't copied any trading bots yet. Browse our marketplace to
            find the perfect bot for your trading strategy.
          </p>
          <Button
            onClick={() => router.push("/ai-bots")}
            size="lg"
            className="gap-2"
          >
            <Bot className="h-5 w-5" />
            Browse Trading Bots
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">My Active Bots</h1>
          <p className="text-muted-foreground">
            Manage your subscribed trading bots and monitor performance
          </p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.result || []}
        enableSearch={true}
        enablePagination={true}
        enableSorting={true}
        fallback={
          isLoading
            ? "Loading subscriptions..."
            : "No active subscriptions found."
        }
      />
    </div>
  );
}
