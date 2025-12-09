import api from "@/lib/api";
import type { ApiResponse, PaginatedResult } from "./constants/type";

export interface TransactionHistoryDTO {
  id: string;
  createdAt: string;
  type: "BUY" | "SELL";
  coinName: string;
  coinSymbol: string;
  coinGeckoId: string;
  quantity: number;
  priceAtExecution: number;
  notionalValue: number;
  feeTradeApplied: number;
}

export interface BotTradeHistoryDTO {
  id: string;
  createdAt: string;
  type: "BUY" | "SELL";
  botName: string;
  coinName: string;
  coinSymbol: string;
  coinGeckoId: string;
  quantity: number;
  priceAtExecution: number;
  notionalValue: number;
  feeBotApplied: number;
}

export type HistoryResponse<T> = ApiResponse<PaginatedResult<T>>;

export interface ManualTransactionParams {
  page?: number;
  size?: number;
  sort?: string;
  type?: "BUY" | "SELL" | null;
  coinName?: string;
  fromDate?: string;
  toDate?: string;
}

export interface BotTransactionParams {
  botSubId: string;
  page?: number;
  size?: number;
  sort?: string;
  type?: "BUY" | "SELL" | null;
  coinName?: string;
  fromDate?: string;
  toDate?: string;
}

export const historyService = {
  /**
   * Fetch manual transactions with pagination and filters
   */
  async getManualTransactions(
    params: ManualTransactionParams,
    accessToken?: string,
  ): Promise<HistoryResponse<TransactionHistoryDTO>> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.type) queryParams.append("type", params.type);
    if (params.coinName) queryParams.append("coinName", params.coinName);
    if (params.fromDate) queryParams.append("fromDate", params.fromDate);
    if (params.toDate) queryParams.append("toDate", params.toDate);

    const url = `/history/transactions/user?${queryParams.toString()}`;
    console.log(url);
    if (accessToken) {
      // Server-side call with token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch manual transactions: ${response.statusText}`,
        );
      }

      return response.json();
    } else {
      // Client-side call (uses axios interceptor)
      const response = await api.get(url);
      return response.data;
    }
  },

  /**
   * Fetch bot transactions with pagination and filters
   */
  async getBotTransactions(
    params: BotTransactionParams,
    accessToken?: string,
  ): Promise<HistoryResponse<BotTradeHistoryDTO>> {
    const queryParams = new URLSearchParams();

    queryParams.append("botSubId", params.botSubId);
    if (params.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params.sort) queryParams.append("sort", params.sort);
    if (params.type) queryParams.append("type", params.type);
    if (params.coinName) queryParams.append("coinName", params.coinName);
    if (params.fromDate) queryParams.append("fromDate", params.fromDate);
    if (params.toDate) queryParams.append("toDate", params.toDate);

    const url = `/history/transactions/bot?${queryParams.toString()}`;

    if (accessToken) {
      // Server-side call with token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch bot transactions: ${response.statusText}`,
        );
      }

      return response.json();
    } else {
      // Client-side call (uses axios interceptor)
      const response = await api.get(url);
      return response.data;
    }
  },
};
