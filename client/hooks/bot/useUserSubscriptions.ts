import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useBotSubService } from "@/services/botSubService";
import {
  SubscriptionPaginatedResponse,
  SubscriptionFilterParams,
} from "@/services/interfaces/botSubInterfaces";

export function useUserSubscriptions(
  params: SubscriptionFilterParams,
): UseQueryResult<SubscriptionPaginatedResponse, Error> {
  const botSubService = useBotSubService();

  return useQuery({
    queryKey: ["user-subscriptions", params],
    queryFn: () => botSubService.getAllSubscriptions(params),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}
