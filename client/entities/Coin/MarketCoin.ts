import { Coin } from "./Coin";

export type MarketCoin = Coin & {
    price: number;
    changePercent: number;
    lastUpdate: number;
    quoteVolume: number;
    history: number[],
}