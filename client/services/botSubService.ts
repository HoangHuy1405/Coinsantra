import useAxiosAuth from "@/hooks/useAxiosAuth";
import { AxiosInstance } from "axios";
import { ApiResponse } from "@/services/constants/type";
import {
  BotSubscription,
  BotSubscriptionDetail,
  SubscriptionPaginatedResponse,
  SubscriptionFilterParams,
} from "./interfaces/botSubInterfaces";

export type BotCopyRequest = {
  botId: string;
  botWalletBalance: number;
  botWalletCoin: number;
  tradePercentage: number;
  maxDailyLossPercentage: number;
};
export type BotUpdateRequest = {
  botWalletBalance: number;
  botWalletCoin: number;
  tradePercentage: number;
  maxDailyLossPercentage: number;
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
    payload: BotUpdateRequest,
  ): Promise<BotSubscriptionResponse> {
    const res = await client.put<BotSubscriptionResponse>(
      `/bot-sub/${botSubId}`,
      payload,
    );
    return res.data;
  },

  /**
   * Fetch all user subscriptions with pagination
   */
  async getAllSubscriptions(
    params: SubscriptionFilterParams,
  ): Promise<SubscriptionPaginatedResponse> {
    const queryParams = new URLSearchParams();

    // Pagination (0-indexed for backend)
    queryParams.append("page", Math.max(0, params.page - 1).toString());
    queryParams.append("size", params.size.toString());

    // Sort by
    if (params.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }

    const response = await client.get<
      ApiResponse<SubscriptionPaginatedResponse>
    >(`/bot-sub?${queryParams.toString()}`);

    if (!response.data.data) {
      throw new Error("No data returned from server");
    }

    return response.data.data;
  },

  /**
   * Fetch detailed subscription metrics
   */
  async getSubscriptionDetail(
    subscriptionId: string,
    timeframe: "current" | "1d" | "7d" = "current",
  ): Promise<BotSubscriptionDetail> {
    const response = await client.get<ApiResponse<BotSubscriptionDetail>>(
      `/bot-sub/${subscriptionId}?timeframe=${timeframe}`,
    );

    if (!response.data.data) {
      throw new Error("Subscription not found");
    }

    return response.data.data;
  },

  // Toggle activate or deactivate bot subscription
  async toggleBotSubscriptionStatus(
    subscriptionId: string,
    enable: boolean,
  ): Promise<BotSubscriptionResponse> {
    const endpoint = `/bot-sub/${subscriptionId}/status?active=${enable}`;
    const response = await client.patch<BotSubscriptionResponse>(endpoint);
    return response.data;
  },
});

export function useBotSubService() {
  const axiosAuth = useAxiosAuth();
  return BotSubService(axiosAuth);
}
