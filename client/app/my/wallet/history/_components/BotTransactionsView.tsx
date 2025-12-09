"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { BotSubscriptionsList } from "./BotSubscriptionsList";
import { BotTransactionsTable } from "./BotTransactionsTable";
import type {
  HistoryResponse,
  BotTradeHistoryDTO,
} from "@/services/historyService";
import type { BotSubscription } from "@/services/interfaces/botSubInterfaces";
import { Card } from "@/app/ui/shadcn/card";

interface BotTransactionsViewProps {
  data: HistoryResponse<BotTradeHistoryDTO> | null;
  subscriptions: BotSubscription[];
  selectedBotId?: string;
  currentPage: number;
  pageSize: number;
}

export function BotTransactionsView({
  data,
  subscriptions,
  selectedBotId,
  currentPage,
  pageSize,
}: BotTransactionsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL-driven bot selection
  const handleSelectSubscription = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("botId", id);
    // Reset page when switching bots
    params.set("page", "0");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const selectedBot = subscriptions.find(
    (sub) => sub.subscriptionId === selectedBotId,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[30%_minmax(0,1fr)]">
      {/* Left Column */}
      <BotSubscriptionsList
        subscriptions={subscriptions}
        selectedSubscription={selectedBotId || ""}
        onSelectSubscription={handleSelectSubscription}
      />

      {/* Right Column */}
      {/* FIX 2: Added `overflow-hidden` to the wrapper to force containment */}
      <div className="flex flex-col overflow-hidden min-w-0">
        {!data ? (
          <Card className="shadow-sm p-12 text-center text-muted-foreground">
            Select a bot subscription to view transactions
          </Card>
        ) : (
          <BotTransactionsTable
            data={data}
            selectedBotName={selectedBot?.botName}
            currentPage={currentPage}
            pageSize={pageSize}
          />
        )}
      </div>
    </div>
  );
}
