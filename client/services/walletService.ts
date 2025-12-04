import useAxiosAuth from "@/hooks/useAxiosAuth";
import { ApiResponse } from "@/services/constants/type";
import { AxiosInstance } from "axios";

export interface AssetDTO {
  balance: number;
  coinHoldings: CoinHolding[];
  totalEquity: number;
  netInvestment: number;
  pnl: number;
  roi: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  pnlChartData: ChartDataPoint[];
}

export interface CoinHolding {
  coinSymbol: string;
  coinName: string;
  amount: number;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
}

export const WalletService = (client: AxiosInstance) => ({
  async getUserAssets(): Promise<AssetDTO> {
    const res = await client.get<ApiResponse<AssetDTO>>(`/wallet/assets`);
    console.log(res);
    if (!res.data.data) {
      throw new Error(res.data.message || "Server returned no data");
    }
    return res.data.data;
  },
});

export function useWalletService() {
  const axiosAuth = useAxiosAuth();
  return WalletService(axiosAuth);
}
