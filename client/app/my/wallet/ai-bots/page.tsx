"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/app/ui/my_components/data-table/data-table";
import { useUserSubscriptions } from "@/hooks/bot/useUserSubscriptions";
import { getSubscriptionColumns } from "./_components/subscription-columns";
import toast from "react-hot-toast";

export default function MySubscriptionsList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"pnl" | "equity" | "bot">("pnl");

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

  // Handle stop subscription
  const handleStopSubscription = (subscriptionId: string, botName: string) => {
    if (
      confirm(
        `Are you sure you want to stop "${botName}"? This will liquidate positions.`,
      )
    ) {
      // TODO: Implement stop API call
      toast.success(`${botName} stopped successfully`);
    }
  };

  // Define columns
  const columns = useMemo(
    () =>
      getSubscriptionColumns({
        onNavigateToDetail: handleNavigateToDetail,
        onStopSubscription: handleStopSubscription,
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
