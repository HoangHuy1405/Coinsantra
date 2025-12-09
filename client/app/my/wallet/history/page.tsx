import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-option";
import { redirect } from "next/navigation";
import { HistoryDashboard } from "./_components/HistoryDashboard";
import { historyService } from "@/services/historyService";
import { getAllSubscriptionsSSR } from "@/services/botSubService";
import type { BotSubscription } from "@/services/interfaces/botSubInterfaces";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/login");
  }

  // 1. Parse URL Parameters - await searchParams in Next.js 15+
  const params = await searchParams;
  const activeTab = (params.tab as "manual" | "bot") || "manual";
  const page = Number(params.page) || 0;
  const size = Number(params.size) || 10;
  const sort = (params.sort as string) || "createdAt,desc";
  const coinFilter = (params.coinSymbol as string) || "all";
  const sideFilter = (params.side as string) || "all";
  const timeRange = (params.timeRange as string) || "all";
  const botId = (params.botId as string) || undefined;

  // Calculate fromDate and toDate based on timeRange
  let fromDate: string | undefined;
  let toDate: string | undefined;

  if (timeRange !== "all") {
    const now = new Date();
    toDate = now.toISOString();

    switch (timeRange) {
      case "5m":
        fromDate = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
        break;
      case "1h":
        fromDate = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
        break;
      case "24h":
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case "7d":
        fromDate = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString();
        break;
    }
  }

  // 2. Data Fetching Logic (Conditional SSR)
  let manualData = null;
  let botData = null;
  let botSubscriptions: BotSubscription[] = [];

  // Common filters object
  const commonFilters = {
    page,
    size,
    sort,
    ...(coinFilter !== "all" &&
      activeTab === "manual" && { coinName: coinFilter }),
    ...(sideFilter !== "all" && { type: sideFilter as "BUY" | "SELL" }),
    ...(fromDate && { fromDate }),
    ...(toDate && { toDate }),
  };

  if (activeTab === "manual") {
    // Only fetch manual data if on manual tab
    manualData = await historyService.getManualTransactions(
      commonFilters,
      session.accessToken,
    );
  } else if (activeTab === "bot") {
    // 1. Fetch Subscriptions (needed for the list)
    const subscriptionsResponse = await getAllSubscriptionsSSR(
      {
        page: 1,
        size: 100, // Fetch all subscriptions for the list
        sortBy: "equity",
      },
      session.accessToken,
    );
    botSubscriptions = subscriptionsResponse.result;

    // 2. Determine which bot is selected (URL param or default to first)
    const activeBotId = botId || botSubscriptions[0]?.subscriptionId;

    // 3. Fetch Transactions for that specific bot
    if (activeBotId) {
      botData = await historyService.getBotTransactions(
        {
          ...commonFilters,
          botSubId: activeBotId,
        },
        session.accessToken, // Assuming this API needs auth
      );
    }
  }

  // 3. Fetch Available Coins (for filter dropdown)
  const availableCoins = [
    "Bitcoin",
    "Ethereum",
    "Solana",
    "Avalanche",
    "Dogecoin",
    "Binance",
  ];

  return (
    <HistoryDashboard
      activeTab={activeTab}
      manualData={manualData}
      botData={botData}
      botSubscriptions={botSubscriptions}
      accessToken={session.accessToken}
      availableCoins={availableCoins}
      currentFilters={{
        coinSymbol: coinFilter,
        side: sideFilter,
        timeRange,
        page,
        size,
        botId: botId || botSubscriptions[0]?.subscriptionId,
      }}
    />
  );
}
