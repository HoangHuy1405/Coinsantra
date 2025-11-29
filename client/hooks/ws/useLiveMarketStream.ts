'use client'

import { MarketCoin } from '@/entities/Coin/MarketCoin';
import { useState, useEffect, useRef } from 'react';


const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws/!ticker@arr";

export const useLiveMarket = (initialData: MarketCoin[]) => {
    const [data, setData] = useState<MarketCoin[]>(initialData);

    const marketMap = useRef<Map<string, MarketCoin>>(new Map());

    useEffect(() => {
        if (marketMap.current.size === 0 && initialData.length > 0) {
            initialData.forEach((coin) => {
                const pair = `${coin.symbol}USDT`;
                marketMap.current.set(pair, coin);
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (initialData.length === 0) return;

        let ws: WebSocket;

        const connectWebSocket = () => {
            ws = new WebSocket(BINANCE_WS_URL);

            ws.onopen = () => {
                // console.log("Connected to Binance Socket");
            };

            ws.onmessage = (event) => {
                const tickers = JSON.parse(event.data);

                tickers.forEach((ticker: any) => {
                    // Chỉ update những coin có trong Map (danh sách lấy từ Server)
                    if (marketMap.current.has(ticker.s)) {
                        const currentCoin = marketMap.current.get(ticker.s)!;
                        const newPrice = parseFloat(ticker.c);

                        // Update coin object
                        const updatedCoin: MarketCoin = {
                            ...currentCoin,
                            price: newPrice,
                            changePercent: parseFloat(ticker.P),
                            quoteVolume: parseFloat(ticker.q),
                            lastUpdate: ticker.E,
                            history: [...currentCoin.history.slice(1), newPrice]
                        };

                        marketMap.current.set(ticker.s, updatedCoin);
                    }
                });
            };


            ws.onclose = () => {
                // setTimeout(connectWebSocket, 5000);
            };
        };

        connectWebSocket();

        // Throttling: Update React State mỗi 1 giây
        const intervalId = setInterval(() => {
            if (marketMap.current.size > 0) {
                setData(Array.from(marketMap.current.values()));
            }
        }, 1000);

        return () => {
            if (ws) ws.close();
            clearInterval(intervalId);
        };
    }, [initialData]); // Dependency là initialData

    return data;
};