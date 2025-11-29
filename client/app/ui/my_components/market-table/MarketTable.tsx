"use client"

import { MarketCoin } from "@/entities/Coin/MarketCoin";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../../shadcn/card";
import { Sparkline } from "../Sparkline/Sparkline";
import { useLiveMarket } from "@/hooks/ws/useLiveMarketStream";
import { Input } from "../../shadcn/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shadcn/select";
import { Button } from "../../shadcn/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../shadcn/tooltip";
import Link from "next/link";
import { Info, TrendingUp } from "lucide-react";

interface MarketTableProps {
    initialData: MarketCoin[];
}

export default function MarketTable({ initialData }: MarketTableProps) {
    const data = useLiveMarket(initialData);

    // State for Search & Sort/Page
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });

    // LOGIC FILTERING 
    const filteredData = useMemo(() => {
        if (!globalFilter) return data;
        const lowerFilter = globalFilter.toLowerCase();

        return data.filter(coin =>
            coin.name.toLowerCase().includes(lowerFilter) ||
            coin.symbol.toLowerCase().includes(lowerFilter)
        );
    }, [data, globalFilter]);

    // LOGIC PAGINATION
    const currentData = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        return filteredData.slice(start, end);
    }, [filteredData, pagination]);

    const pageCount = Math.ceil(filteredData.length / pagination.pageSize);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalFilter(e.target.value);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    const columns = useMemo<ColumnDef<MarketCoin>[]>(
        () => [
            {
                accessorKey: 'market_cap_rank',
                header: '#',
                cell: (info) => (
                    <span className="text-gray-500 ">
                        {info.getValue() as number}
                    </span>
                ),
            },
            {
                accessorKey: 'name',
                header: 'Coin',
                cell: (info) => (
                    <div className="flex items-center gap-3">
                        <Image
                            src={info.row.original.image}
                            alt={info.row.original.symbol}
                            height={32}
                            width={32}
                            className="w-8 h-8 rounded-full"
                        />
                        <div className="flex flex-col">
                            <span className="font-bold">{info.row.original.symbol}</span>
                            <span className="text-xs text-foreground">{info.getValue() as string}</span>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: 'price',
                header: 'Price',
                cell: (info) => {
                    const val = info.getValue() as number;
                    return <span className="font-mono font-medium">${val.toFixed(2)}</span>;
                },
            },
            {
                accessorKey: 'changePercent',
                header: '24h Change',
                cell: (info) => {
                    const val = info.getValue() as number;
                    const color = val >= 0 ? 'text-green-600' : 'text-red-600';
                    return (
                        <span className={`font-semibold ${color}`}>
                            {val > 0 ? '+' : ''}{val.toFixed(2)}%
                        </span>
                    );
                },
            },
            {
                accessorKey: 'history',
                header: 'Last 50 Updates',
                enableSorting: false,
                cell: (info) => {
                    const history = info.getValue() as number[];
                    const isPositive = (info.row.original.changePercent >= 0);
                    return <Sparkline data={history} color={isPositive ? '#16a34a' : '#dc2626'} />;
                },
            },
            {
                id: "actions", // Cột này không cần accessorKey vì không hiện data trực tiếp
                header: "Actions",
                enableSorting: false,
                cell: ({ row }) => {
                    const coin = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            {/* Nút Details */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600">
                                            <Link href={`/market/${coin.id}`}>
                                                <Info className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>View Details</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            {/* Nút Trade */}
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-50 hover:text-green-600">
                                            <Link href={`/trade/${coin.symbol}`}>
                                                <TrendingUp className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Trade {coin.symbol}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    );
                },
            },
        ],
        []
    );

    const table = useReactTable({
        data: currentData,
        columns,
        pageCount,
        state: {
            sorting,
            pagination
        },
        manualPagination: true,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false,
    });

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>Live Crypto Market</CardTitle>
                <div>
                    <Input
                        type="text"
                        placeholder="Search coin..."
                        value={globalFilter}
                        onChange={handleSearchChange}
                        className="relative w-full sm:w-64"
                    />
                </div>
            </CardHeader>

            <CardContent>
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="p-4 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{
                                                asc: ' ▲',
                                                desc: ' ▼',
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {currentData.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <RowWithMotion key={row.original.id} row={row} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="p-8 text-center text-card-foreground">
                                    No coins found matching "{globalFilter}"
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4 px-2">
                    {/* Left: Rows per page Selector */}
                    <div className="flex items-center gap-2 text-sm text-card-foreground">
                        <span>Show</span>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                                table.setPageIndex(0);
                            }}

                        >
                            <SelectTrigger className="h-8 ">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top" >
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span>rows</span>
                    </div>

                    {/* Right: Navigation Buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="subtle"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            title="Go to first page"
                        >
                            {'<<'} First
                        </Button>
                        <Button
                            variant="subtle"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>

                        <span className="text-sm mx-2 text-gray-700">
                            {pageCount > 0 ? (
                                <>Page {table.getState().pagination.pageIndex + 1} of {pageCount}</>
                            ) : (
                                <>Page 0 of 0</>
                            )}
                        </span>

                        <Button
                            variant="subtle"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                        <Button
                            variant="subtle"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            title="Go to last page"
                        >
                            Last {'>>'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const RowWithMotion = ({ row }: { row: any }) => {
    return (
        <motion.tr
            layout
            initial={false} // Không animate khi vào trang
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 40,
                duration: 0.3
            }}
            className="hover:bg-gray-50 bg-white"
        >
            {row.getVisibleCells().map((cell: any) => (
                <td key={cell.id} className="p-4 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
            ))}
        </motion.tr>
    );
};