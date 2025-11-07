"use client"

import { Button } from "@/app/ui/shadcn/button"
import { Checkbox } from "@/app/ui/shadcn/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/app/ui/shadcn/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

export type PortfolioCoin = {
    id: string
    symbol: string
    name: string
    image: string
    amount: number
    value: number
    sellFee: number
}

export const portfolioColumns: ColumnDef<PortfolioCoin>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Coin",
        enableGlobalFilter: true,
        cell: ({ row }) => {
            const coin = row.original
            return (
                <div className="flex items-center gap-3">
                    <img
                        src={coin.image}
                        alt={coin.name}
                        width={28}
                        height={28}
                        className="rounded-full"
                    />
                    <div>
                        <div className="font-medium">{coin.name}</div>
                        <div className="text-xs text-muted-foreground uppercase">
                            {coin.symbol}
                        </div>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
            <div className="font-medium">
                {row.original.amount.toLocaleString() + " " + row.original.symbol.toUpperCase()}
            </div>
        ),
    },
    {
        accessorKey: "value",
        header: "Value (USD)",
        cell: ({ row }) => (
            <div className=" text-emerald-500 font-semibold">
                ${row.original.value.toLocaleString()}
            </div >
        ),
    },
    {
        accessorKey: "sellFee",
        header: "Sell Fee",
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                {row.original.sellFee.toFixed(2)}%
            </div>
        ),
    },
    {
        id: "actions",
        header: "", // không cần tiêu đề
        enableHiding: false,
        cell: ({ row }) => {
            const coin = row.original

            const handleEdit = () => {
                console.log("Edit fee for:", coin.name)
            }

            const handleDelete = () => {
                if (confirm(`Are you sure to delete ${coin.name}?`)) {
                    console.log("Deleted:", coin.name)
                }
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={6}
                        className="w-40 rounded-lg shadow-md"
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={handleEdit}
                            className="flex items-center gap-2 text-sm hover:bg-muted/50 focus:bg-muted/50 cursor-pointer"
                        >
                            <Pencil className="h-4 w-4 text-blue-500" />
                            <span>Edit</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                            variant="destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    }
]
