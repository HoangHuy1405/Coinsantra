import { fetchBots } from "@/services/botService";
import { BotFilterParams } from "@/services/interfaces/botInterfaces";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export const usePublicBots = (params: BotFilterParams) => {
  return useQuery({
    queryKey: ["public-bots", params],
    queryFn: () => fetchBots(params),
    placeholderData: keepPreviousData,
    staleTime: 5000,
  });
};
