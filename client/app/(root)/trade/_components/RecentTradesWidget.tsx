"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type Trade = {
    id: string
    price: number
    amount: number
    time: string
    side: "buy" | "sell"
}

export default function RecentTradesWidget() {
    const [trades, setTrades] = useState<Trade[]>([])

    // Giả lập WebSocket Stream
    useEffect(() => {
        const interval = setInterval(() => {
            const newTrade: Trade = {
                id: Math.random().toString(36).substr(2, 9),
                price: 68000 + Math.random() * 50 * (Math.random() > 0.5 ? 1 : -1),
                amount: Number((Math.random() * 2).toFixed(4)),
                time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
                side: Math.random() > 0.5 ? "buy" : "sell"
            }

            setTrades(prev => {
                // giữ lại 50 lệnh mới nhất. 
                const updated = [newTrade, ...prev];
                if (updated.length > 50) updated.length = 50;
                return updated;
            })
        }, 300)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex flex-col h-full text-xs overflow-hidden">
            <div className="font-bold text-muted-foreground mb-2 px-2">Market Trades</div>

            {/* HEADER  */}
            <div className="grid grid-cols-3 px-2 py-1 text-muted-foreground font-semibold bg-secondary/10">
                <div className="text-left">Price</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Time</div>
            </div>

            {/* Scrollbar */}
            <div className="overflow-y-auto">
                {trades.map((trade) => {
                    const isBuy = trade.side === "buy";
                    return (
                        <div key={trade.id} className="grid grid-cols-3 px-2 py-0.5 hover:bg-secondary/10 cursor-pointer transition-colors">
                            <div className={cn("font-mono font-bold", isBuy ? "text-[#0ecb81]" : "text-[#f6465d]")}>
                                {trade.price.toFixed(2)}
                            </div>
                            <div className="text-right font-mono text-foreground opacity-90">
                                {trade.amount.toFixed(4)}
                            </div>
                            <div className="text-right text-muted-foreground font-mono opacity-70">
                                {trade.time}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}