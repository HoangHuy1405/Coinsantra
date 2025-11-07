"use client"

import { Button } from "@/app/ui/shadcn/button"
import { Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"
import clsx from "clsx"

interface DataTablePaginationProps<TData> {
    table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
    const pageCount = table.getPageCount()
    const currentPage = table.getState().pagination.pageIndex + 1
    const pages = getPaginationRange(currentPage, pageCount)

    return (
        <div className="flex items-center justify-between py-3 px-4 border-t border-border/50">
            {/* Nút Previous */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="w-28 justify-center"
            >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-2">
                {pages.map((page, i) =>
                    page === "..." ? (
                        <span key={`dots-${i}`} className="px-2 text-muted-foreground">
                            ...
                        </span>
                    ) : (
                        <Button
                            key={page}
                            variant={page === currentPage ? "default" : "ghost"}
                            size="sm"
                            onClick={() => table.setPageIndex(page - 1)}
                            className={clsx(
                                "w-8 h-8 rounded-md text-sm",
                                page === currentPage &&
                                "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                        >
                            {page}
                        </Button>
                    )
                )}
            </div>

            {/* Nút Next */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="w-28 justify-center"
            >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
        </div>
    )
}

/**
 * 🧮 Helper: chỉ hiển thị 1–3 đầu, 2 cuối, 2 quanh current
 * → [1, 2, 3, ..., 8, 9, 10]
 */
function getPaginationRange(current: number, total: number, delta = 1) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    const range: (number | "...")[] = []
    const left = Math.max(2, current - delta)
    const right = Math.min(total - 1, current + delta)

    range.push(1)
    if (left > 2) range.push("...")

    for (let i = left; i <= right; i++) range.push(i)

    if (right < total - 1) range.push("...")
    range.push(total)

    return range
}
