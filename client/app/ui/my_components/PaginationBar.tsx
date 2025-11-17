"use client";

import { cn } from "@/lib/utils";
import { Button } from "../shadcn/button";

interface PaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationBar({
  totalItems,
  itemsPerPage = 9,
  currentPage,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const createPageArray = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const pages = createPageArray();

  return (
    <div
      className={cn("flex items-center justify-center gap-2 py-6", className)}
    >
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="min-w-[80px]"
      >
        Previous
      </Button>

      {/* Page Buttons */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          typeof page === "string" ? (
            <span
              key={index}
              className="px-2 text-muted-foreground select-none"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              className={cn(
                "w-9 h-9 p-0",
                page === currentPage && "font-semibold",
              )}
              onClick={() => onPageChange(page)} // page is guaranteed number here
            >
              {page}
            </Button>
          ),
        )}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="min-w-[80px]"
      >
        Next
      </Button>
    </div>
  );
}
