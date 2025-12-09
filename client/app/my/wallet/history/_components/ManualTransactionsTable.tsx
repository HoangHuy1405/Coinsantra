"use client";

import { useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Card } from "@/app/ui/shadcn/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/ui/shadcn/table";
import { Badge } from "@/app/ui/shadcn/badge";
import { Button } from "@/app/ui/shadcn/button";
import { ChevronLeft, ChevronRight, Loader2, ArrowUpDown } from "lucide-react";
import type {
  HistoryResponse,
  TransactionHistoryDTO,
} from "@/services/historyService";

interface ManualTransactionsTableProps {
  data: HistoryResponse<TransactionHistoryDTO>;
  currentPage: number;
  pageSize: number;
  showPagination?: boolean;
}

const columnHelper = createColumnHelper<TransactionHistoryDTO>();

export function ManualTransactionsTable({
  data,
  currentPage,
  pageSize,
  showPagination = true,
}: ManualTransactionsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = data.data?.meta.pages || 0;
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleSort = (columnId: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      const currentSort = params.get("sort") || "";

      // Toggle sort direction
      let newSort = `${columnId},desc`;
      if (currentSort === `${columnId},desc`) {
        newSort = `${columnId},asc`;
      } else if (currentSort === `${columnId},asc`) {
        newSort = "createdAt,desc"; // Reset to default
      }

      params.set("sort", newSort);
      params.set("page", "0"); // Reset to first page when sorting
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("createdAt", {
        header: () => (
          <button
            onClick={() => handleSort("createdAt")}
            className="flex items-center gap-1 hover:text-primary
              transition-colors cursor-pointer"
          >
            Time
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => {
          const { date, time } = formatDate(info.getValue());
          return (
            <div>
              <p className="text-sm">{date}</p>
              <p className="font-mono text-xs text-muted-foreground">{time}</p>
            </div>
          );
        },
      }),
      columnHelper.accessor("coinName", {
        header: "Coin",
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center
                  justify-center rounded-full bg-primary/10 border
                  border-primary/20"
              >
                <span className="text-primary text-xs font-semibold">
                  {row.coinSymbol}
                </span>
              </div>
              <div>
                <p className="font-medium">{row.coinName}</p>
                <p className="text-xs text-muted-foreground">
                  {row.coinSymbol}
                </p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => {
          const type = info.getValue();
          return (
            <Badge
              variant="outline"
              className={
                type === "BUY"
                  ? `border-green-500/30 bg-green-500/10 text-green-700
                    dark:text-green-400`
                  : `border-red-500/30 bg-red-500/10 text-red-700
                    dark:text-red-400`
              }
            >
              {type}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("priceAtExecution", {
        header: () => (
          <button
            onClick={() => handleSort("priceAtExecution")}
            className="flex items-center gap-1 hover:text-primary
              transition-colors cursor-pointer"
          >
            Price
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => {
          const price = info.getValue();
          return (
            <span className="font-mono text-sm">
              $
              {price != null
                ? price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0.00"}
            </span>
          );
        },
      }),
      columnHelper.accessor("quantity", {
        header: () => (
          <button
            onClick={() => handleSort("quantity")}
            className="flex items-center gap-1 hover:text-primary
              transition-colors cursor-pointer"
          >
            Amount
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => {
          const amount = info.getValue();
          return (
            <span className="font-mono text-sm">
              {amount != null
                ? amount.toLocaleString("en-US", {
                    minimumFractionDigits: amount < 1 ? 4 : 2,
                    maximumFractionDigits: amount < 1 ? 8 : 4,
                  })
                : "0"}
            </span>
          );
        },
      }),
      columnHelper.accessor("notionalValue", {
        header: () => (
          <button
            onClick={() => handleSort("notionalValue")}
            className="flex items-center gap-1 hover:text-primary
              transition-colors cursor-pointer"
          >
            Total
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => {
          const total = info.getValue();
          return (
            <span className="font-mono text-sm">
              $
              {total != null
                ? total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "0.00"}
            </span>
          );
        },
      }),
      columnHelper.accessor("feeTradeApplied", {
        header: () => (
          <button
            onClick={() => handleSort("feeTradeApplied")}
            className="flex items-center gap-1 hover:text-primary
              transition-colors cursor-pointer"
          >
            Fee
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => {
          const fee = info.getValue();
          return (
            <span className="font-mono text-sm text-muted-foreground">
              ${fee != null ? fee.toFixed(2) : "0.00"}
            </span>
          );
        },
      }),
    ],
    [handleSort],
  );

  const table = useReactTable({
    data: data.data?.result || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="shadow-sm flex flex-col justify-between relative">
      {isPending && (
        <div
          className="absolute inset-0 bg-background/50 backdrop-blur-sm flex
            items-center justify-center z-10 rounded-lg"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div className="overflow-x-auto px-6">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {showPagination && (
        <div className="flex items-center justify-between p-4 px-6 border-t">
          <div className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
