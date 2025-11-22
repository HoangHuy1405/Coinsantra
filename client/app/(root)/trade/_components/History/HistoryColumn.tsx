"use client"

import { ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

export type Trade = {
    id: string
    time: string
    symbol: string
    side: "buy" | "sell"
    price: number
    amount: number
    status: "filled" | "canceled" | "open"
}

export const history_columns: ColumnDef<Trade>[] = [
    {
        accessorKey: "time",
        header: "Time",
        cell: ({ row }) => <span className="text-muted-foreground font-mono text-xs">{row.getValue("time")}</span>,
    },
    {
        accessorKey: "symbol",
        header: "Symbol",
        cell: ({ row }) => <span className="font-bold text-xs">{row.getValue("symbol")}</span>,
    },
    {
        accessorKey: "side",
        header: "Side",
        cell: ({ row }) => {
            const side = row.getValue("side") as string
            return (
                <span className={cn(
                    "font-bold text-xs uppercase",
                    side === "buy" ? "text-[#0ecb81]" : "text-[#f6465d]"
                )}>
                    {side}
                </span>
            )
        },
    },
    {
        accessorKey: "price",
        header: () => <div className="text-right">Price</div>,
        cell: ({ row }) => {
            const val = parseFloat(row.getValue("price"))
            return <div className="text-right font-mono text-xs text-foreground">{val.toLocaleString()}</div>
        },
    },
    {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const val = parseFloat(row.getValue("amount"))
            return <div className="text-right font-mono text-xs text-muted-foreground">{val}</div>
        },
    },
    {
        accessorKey: "status",
        header: () => <div className="text-right">Status</div>,
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return <div className="text-right text-[10px] uppercase font-medium">{status}</div>
        },
    },
]