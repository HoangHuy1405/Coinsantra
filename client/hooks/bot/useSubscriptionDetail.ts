import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useBotSubService } from "@/services/botSubService";
import { BotSubscriptionDetail } from "@/services/interfaces/botSubInterfaces";

export function useSubscriptionDetail(
  subscriptionId: string,
  timeframe: "current" | "1d" | "7d" = "current",
): UseQueryResult<BotSubscriptionDetail, Error> {
  const botSubService = useBotSubService();

  return useQuery({
    queryKey: ["subscription-detail", subscriptionId, timeframe],
    queryFn: () =>
      botSubService.getSubscriptionDetail(subscriptionId, timeframe),
    enabled: !!subscriptionId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}
