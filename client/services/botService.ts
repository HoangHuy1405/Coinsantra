import useAxiosAuth from "@/hooks/useAxiosAuth";
import { BotFormInputs } from "./schemas/bot";
import axios, { AxiosInstance } from "axios";
import { ApiResponse } from "@/services/constants/type";

import { sfAnd, sfLike } from "spring-filter-query-builder";
import {
  BotSecretResponse,
  BotResponse,
  BotFilterParams,
  BotPaginatedResponse,
} from "./interfaces/botInterfaces";
import api from "@/lib/api";

export const BotService = (client: AxiosInstance) => ({
  async createBot(formData: BotFormInputs): Promise<BotSecretResponse> {
    const payload = {
      name: formData.name,
      description: formData.description || null,
      coinSymbol: formData.coinSymbol,
      tradingPair: formData.tradingPair || null,
      category: formData.category,
      riskLevel: formData.riskLevel,

      // Operational URLs
      websocketUrl: formData.websocketUrl || null,
      healthCheckUrl: formData.healthUrl || null,
    };

    // 2. Make the request
    console.log(payload);
    const res = await client.post<ApiResponse<BotSecretResponse>>(
      "/admin/bots",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!res.data.data) {
      throw new Error(res.data.message || "Server returned no data");
    }
    return res.data.data;
  },

  async getAllBots(): Promise<BotResponse[]> {
    const res = await client.get<ApiResponse<BotResponse[]>>(`/admin/bots`, {
      params: { includesStats: true },
    });
    if (!res.data.data) return [];
    return res.data.data;
  },

  async getBotForEdit(botId: string): Promise<BotResponse> {
    const res = await client.get<ApiResponse<BotResponse>>(
      `/admin/bots/${botId}`,
      {
        params: { includeStats: true },
      },
    );

    if (!res.data.data) throw new Error("Bot not found");
    return res.data.data;
  },

  async updateBot(
    botId: string,
    formData: BotFormInputs,
  ): Promise<BotResponse> {
    // Map form data to backend DTO
    const payload = {
      name: formData.name,
      description: formData.description || null,
      coinSymbol: formData.coinSymbol,
      tradingPair: formData.tradingPair || null,
      category: formData.category,
      riskLevel: formData.riskLevel,
      websocketUrl: formData.websocketUrl || null,
      healthCheckUrl: formData.healthUrl || null,
    };

    const res = await client.put<ApiResponse<BotResponse>>(
      `/admin/bots/${botId}`,
      payload,
    );

    if (!res.data.data) throw new Error("Failed to update bot");
    return res.data.data;
  },

  async deleteBot(botId: string): Promise<void> {
    await client.delete(`/admin/bots/${botId}`);
  },
});

// Hook to expose the service with the authenticated client
export function useBotService() {
  const axiosAuth = useAxiosAuth();
  return BotService(axiosAuth);
}

// Public api
export const fetchBots = async (
  params: BotFilterParams,
): Promise<BotPaginatedResponse> => {
  const queryParams = new URLSearchParams();

  // A. Pagination (0-indexed for backend)
  queryParams.append("page", Math.max(0, params.page - 1).toString());
  queryParams.append("size", params.size.toString());

  // B. Filtering Logic using Builder
  const filters = [];

  // 1. Search by Name (Like)
  if (params.search) {
    // "name ~~ '%value%'"
    filters.push(sfLike("name", `*${params.search}*`));
  }

  // 2. Active Only (Default filter example)
  // filters.push(sfEqual("status", "ACTIVE"));

  // 3. Time Window (Optional logic)
  // If your backend filters stats dynamically, pass this as a separate param
  // If you filter CreatedAt:
  // if (params.timeWindow === '1d') {
  //    const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
  //    filters.push(sfGe("createdAt", oneDayAgo));
  // }

  // Combine all filters with AND
  if (filters.length > 0) {
    const filterQuery = sfAnd(filters).toString();
    queryParams.append("filter", filterQuery);
  }

  // C. Sorting
  // if (params.sort) {
  //   let sortField = "stats.totalProfit";

  //   // Logic Fix: Determine suffix based on the TimeWindow directly
  //   // If "all" or undefined, default to "24h" (or whatever your default stat is)
  //   // If "1d", use "24h"
  //   let suffix = "24h";
  //   if (params.timeWindow === "7d") suffix = "7d";
  //   if (params.timeWindow === "30d") suffix = "30d";
  //   // Note: If params.timeWindow is "all", suffix remains "24h" (default)
  //   // Adjust this if your backend actually has fields like 'pnlAllTime'

  //   switch (params.sort) {
  //     case "pnl":
  //       // Maps to: stats.pnl24h, stats.pnl7d, stats.pnl30d
  //       sortField = `stats.pnl${suffix}`;
  //       break;
  //     case "roi":
  //       // Maps to: stats.roi24h, stats.roi7d, stats.roi30d
  //       sortField = `stats.roi${suffix}`;
  //       break;
  //     case "copied":
  //       sortField = "stats.copyingUsers";
  //       break;
  //   }
  //   queryParams.append("sort", `${sortField},desc`);
  // }

  const response = await api.get<BotPaginatedResponse>(
    `/bots?${queryParams.toString()}`,
  );
  return response.data;
};
