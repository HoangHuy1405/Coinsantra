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
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence nếu muốn hiệu ứng list
import { Card, CardContent, CardHeader } from "../../shadcn/card";

import { Sparkline } from "../Sparkline/Sparkline";
import { useLiveMarket } from "@/hooks/ws/useLiveMarketStream";

interface MarketTableProps {
    initialData: MarketCoin[];
}

export default function MarketTable({ initialData }: MarketTableProps) {
    // 1. Dữ liệu gốc từ Socket
    const data = useLiveMarket(initialData);

    // 2. State cho Search và Sort/Page
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });

    // 3. LOGIC FILTERING (Tìm kiếm)
    // Lọc data trước khi phân trang
    const filteredData = useMemo(() => {
        if (!globalFilter) return data; // Nếu không tìm gì thì trả về full
        const lowerFilter = globalFilter.toLowerCase();

        return data.filter(coin =>
            coin.name.toLowerCase().includes(lowerFilter) ||
            coin.symbol.toLowerCase().includes(lowerFilter)
        );
    }, [data, globalFilter]);

    // 4. LOGIC PAGINATION (Cắt trang)
    // Cắt từ filteredData thay vì data gốc
    const currentData = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        return filteredData.slice(start, end);
    }, [filteredData, pagination]);

    // Tính tổng số trang dựa trên dữ liệu đã lọc
    const pageCount = Math.ceil(filteredData.length / pagination.pageSize);

    // Hàm xử lý khi nhập tìm kiếm -> Reset về trang 1
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGlobalFilter(e.target.value);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    const columns = useMemo<ColumnDef<MarketCoin>[]>(
        () => [
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
                            <span className="font-bold text-gray-900">{info.row.original.symbol}</span>
                            <span className="text-xs text-gray-500">{info.getValue() as string}</span>
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
                        <span className={`font-mono font-bold ${color}`}>
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
                <h2 className="text-2xl font-bold">Live Crypto Market</h2>

                {/* --- SEARCH INPUT --- */}
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search coin..."
                        value={globalFilter}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    />
                    {/* Search Icon (SVG) */}
                    <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </CardHeader>

            <CardContent>
                <div className="border rounded-lg overflow-hidden">
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
                                    <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                                        No coins found matching "{globalFilter}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4 px-2">
                    {/* Left: Rows per page Selector */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Show</span>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => {
                                table.setPageSize(Number(e.target.value));
                                // Reset pageIndex về 0 khi đổi pageSize để tránh lỗi trang trắng
                                table.setPageIndex(0);
                            }}
                            className="border border-gray-300 rounded p-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {[10, 20, 30, 40, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                        <span>rows</span>
                    </div>

                    {/* Right: Navigation Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-600"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            title="Go to first page"
                        >
                            {'<<'} First
                        </button>
                        <button
                            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-600"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </button>

                        <span className="text-sm font-mono mx-2 text-gray-700">
                            {pageCount > 0 ? (
                                <>Page {table.getState().pagination.pageIndex + 1} of {pageCount}</>
                            ) : (
                                <>Page 0 of 0</>
                            )}
                        </span>

                        <button
                            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-600"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </button>
                        <button
                            className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-600"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            title="Go to last page"
                        >
                            Last {'>>'}
                        </button>
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