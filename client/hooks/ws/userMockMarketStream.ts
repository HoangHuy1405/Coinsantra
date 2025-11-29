
import { MarketCoin } from "@/entities/Coin/MarketCoin";
import { useEffect, useRef, useState } from "react";

export const useCryptoSocketMock = (initialData: MarketCoin[]) => {
    const [data, setData] = useState<MarketCoin[]>(initialData);
    const dataRef = useRef<MarketCoin[]>(initialData);

    useEffect(() => {
        // Giả lập Socket nhận data liên tục (100ms một lần)
        const socketInterval = setInterval(() => {
            // Logic random thay đổi giá và update history
            dataRef.current = dataRef.current.map((coin) => {
                if (Math.random() > 0.7) return coin; // 70% không đổi để đỡ rối mắt

                const newPrice = coin.price * (1 + (Math.random() * 0.02 - 0.01));
                const newHistory = [...coin.history.slice(1), newPrice]; // Giữ 50 item

                return {
                    ...coin,
                    price: newPrice,
                    changePercent: coin.changePercent + (Math.random() * 0.5 - 0.25),
                    history: newHistory,
                };
            });
        }, 50); // Socket bắn rất nhanh

        // UI UPDATE LOOP (Throttling)
        // Chỉ update React State mỗi 1 giây để animation có thể chạy mượt
        // và tránh re-render quá nhiều.
        const uiInterval = setInterval(() => {
            setData([...dataRef.current]);
        }, 1000);

        return () => {
            clearInterval(socketInterval);
            clearInterval(uiInterval);
        };
    }, []);

    return data;
};