"use client";

import { useEffect, useRef, useState } from "react";

export interface MarketTicker {
  symbol: string;
  price: number;
  changePercent: number;
  history: number[]; // sparkline data
  lastUpdate: number;
  quoteVolume: number;
}

export function useLiveMarketStream(symbols: string[], historyLength = 20) {
  const [tickers, setTickers] = useState<Record<string, MarketTicker>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbols.length) return;

    const streams = symbols
      .map((s) => `${s.toLowerCase()}usdt@ticker`)
      .join("/");
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => console.log("[WS] Connected to Binance multi-stream");
    ws.onclose = () => console.log("[WS] Closed Binance stream");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data?.data) return;
      const t = data.data;
      const symbol = t.s.replace("USDT", "");

      setTickers((prev) => {
        const existing = prev[symbol];
        const price = parseFloat(t.c);
        const changePercent = parseFloat(t.P);
        const quoteVolume = parseFloat(t.q);
        const history = existing
          ? [...existing.history.slice(-historyLength + 1), price]
          : Array(historyLength).fill(price);

        return {
          ...prev,
          [symbol]: {
            symbol,
            price,
            changePercent,
            history,
            lastUpdate: t.E,
            quoteVolume,
          },
        };
      });
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [symbols, historyLength]);

  return tickers;
}
