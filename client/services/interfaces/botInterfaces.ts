import { Bot } from "@/entities/mockAiBots";
import { BotCategory, BotStatus } from "../constants/botConstant";
import { ApiResponse, PaginatedResult } from "../constants/type";

export interface BotSecretResponse {
  botId: string;
  name: string;
  webhookToken: string;
  apiSecret: string;
  webhookUrl: string;
}
export interface BotResponse {
  id: string;
  name: string;
  description?: string;
  category: BotCategory; // Matches BotCategory enum string
  status: BotStatus;
  createdAt: string;

  tradingConfig?: {
    coinSymbol: string;
    tradingPair?: string;
    riskLevel: string;
  };

  integrationConfig?: {
    websocketUrl?: string;
    healthCheckUrl?: string;
  };

  stats?: {
    totalTrades: number;
    uptime: number;
    copyingUsers: number;
    roi24h?: number;
    pnl24h?: number;
    lastSignalAt?: string;
  };
}
export type TimeWindow = "1d" | "7d" | "30d" | "all";
export type SortOption = "pnl" | "roi" | "copied";
export interface BotFilterParams {
  page: number;
  size: number;
  search?: string;
  sort?: SortOption;
  timeWindow?: TimeWindow;
}
export type BotPaginatedResponse = ApiResponse<PaginatedResult<BotResponse>>;
