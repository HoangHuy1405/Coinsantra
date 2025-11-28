import useAxiosAuth from "@/hooks/useAxiosAuth";
import { AxiosInstance } from "axios";

export type BotCopyRequest = {
  botId: string;
  allocatedAmount: number;
  allocatedCoin: number;
  tradePercentage: number; // Sent as decimal (0.01 - 1.0)
  maxDailyLossPercentage: number; // Sent as decimal (0.01 - 1.0)
};

export type BotSubscriptionResponse = {
  id: string;
  botId: string;
  botName: string;
  userId: string;
  allocatedAmount: number;
  allocatedCoin: number;
  tradePercentage: number;
  status: string;
  totalProfit: number;
  startedAt: string;
};

export const BotSubService = (client: AxiosInstance) => ({
  async copyBot(payload: BotCopyRequest): Promise<BotSubscriptionResponse> {
    const res = await client.post<BotSubscriptionResponse>("/bot-sub", payload);
    return res.data;
  },

  async updateBotSub(
    botSubId: string,
    payload: BotCopyRequest,
  ): Promise<BotSubscriptionResponse> {
    const res = await client.put<BotSubscriptionResponse>(
      `/bot-sub/${botSubId}`,
      payload,
    );
    return res.data;
  },
});

export function useBotSubService() {
  const axiosAuth = useAxiosAuth();
  return BotSubService(axiosAuth);
}
