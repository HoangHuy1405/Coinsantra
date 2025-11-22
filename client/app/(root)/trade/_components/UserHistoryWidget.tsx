"use client"

import { useRef, useState, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

type UserOrder = {
    id: number
    symbol: string
    side: "buy" | "sell"
    price: number
    amount: number
    total: number
    status: string
    time: string
}

interface UserHistoryWidgetProps {
    symbol: string;
}

export default function UserHistoryWidget({ symbol }: UserHistoryWidgetProps) {
    const parentRef = useRef<HTMLDivElement>(null)
    const [allData, setAllData] = useState<UserOrder[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    // --- LOGIC GIẢ LẬP FETCH API (Load More) ---
    const fetchMoreData = async (startIndex: number) => {
        setIsLoading(true)
        // Giả lập delay mạng 0.5s
        await new Promise(resolve => setTimeout(resolve, 500))

        const newItems: UserOrder[] = Array.from({ length: 20 }).map((_, i) => ({
            id: startIndex + i,
            symbol: symbol,
            side: Math.random() > 0.5 ? "buy" : "sell",
            price: 68000 + Math.random() * 100,
            amount: Math.random(),
            total: (68000 * Math.random()),
            status: "Filled",
            time: new Date().toLocaleString()
        }))

        setAllData(prev => [...prev, ...newItems])
        setIsLoading(false)

        // Giả sử chỉ có 1000 dòng lịch sử
        if (allData.length > 1000) setHasMore(false)
    }

    // Load lần đầu
    useEffect(() => {
        fetchMoreData(0)
    }, [])

    // --- VIRTUALIZER SETUP ---
    const rowVirtualizer = useVirtualizer({
        count: hasMore ? allData.length + 1 : allData.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 32,
        overscan: 5,
    })

    useEffect(() => {
        const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse()
        if (!lastItem) return

        if (
            lastItem.index >= allData.length - 1 &&
            hasMore &&
            !isLoading
        ) {
            fetchMoreData(allData.length)
        }
    }, [
        hasMore,
        isLoading,
        allData.length,
        rowVirtualizer.getVirtualItems(),
    ])

    return (
        <div className="h-full flex flex-col text-xs">
            {/* HEADER */}
            <div className="grid grid-cols-6 gap-2 px-4 py-2 font-bold text-muted-foreground border-b bg-secondary/10 shrink-0">
                <div>Time</div>
                <div>Symbol</div>
                <div>Side</div>
                <div className="text-right">Price</div>
                <div className="text-right">Amount</div>
                <div className="text-right">Total</div>
            </div>

            {/* VIRTUAL SCROLL CONTAINER */}
            <div
                ref={parentRef}
                className="flex-1 overflow-y-auto w-full relative"
                style={{ contain: 'strict' }}
            >
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const isLoaderRow = virtualRow.index > allData.length - 1
                        const item = allData[virtualRow.index]

                        return (
                            <div
                                key={virtualRow.key}
                                className="absolute top-0 left-0 w-full"
                                style={{
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                {isLoaderRow ? (
                                    <div className="flex justify-center items-center h-full text-muted-foreground">
                                        {hasMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'End of history'}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-6 gap-2 px-4 items-center h-full hover:bg-secondary/10 border-b border-secondary/5 transition-colors">
                                        <span className="text-muted-foreground font-mono">{item.time.split(' ')[1]}</span>
                                        <span className="font-bold">{item.symbol}</span>
                                        <span className={cn("uppercase font-bold", item.side === "buy" ? "text-[#0ecb81]" : "text-[#f6465d]")}>
                                            {item.side}
                                        </span>
                                        <span className="text-right font-mono">{item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                        <span className="text-right font-mono">{item.amount.toFixed(4)}</span>
                                        <span className="text-right font-mono text-muted-foreground">{item.total.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}