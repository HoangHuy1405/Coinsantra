"use client";

import { Input } from "@/app/ui/shadcn/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/app/ui/shadcn/select";
import { cn } from "@/lib/utils";
import { timeSlot } from "./BotCard";
import { Search, Info, SlidersHorizontal } from "lucide-react";

interface FilterSortBarProps {
  enableSearch?: boolean;

  searchValue: string;
  onSearchChange: (value: string) => void;

  sortValue: "pnl" | "roi" | "copied";
  onSortChange: (value: "pnl" | "roi" | "copied") => void;

  timeWindow: timeSlot;
  onTimeWindowChange: (value: timeSlot) => void;

  pageNumber?: number;
  className?: string;
}

export function FilterSortBar({
  enableSearch = true,
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
  timeWindow,
  onTimeWindowChange,
  pageNumber,
  className,
}: FilterSortBarProps) {
  return (
    <div
      className={cn(
        `w-full flex flex-col md:flex-row md:items-center md:justify-between
        gap-4 `,
        className,
      )}
    >
      {/* Left side: Search */}
      {enableSearch && (
        <Input
          placeholder="Search bots..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full md:max-w-xs"
        />
      )}

      {pageNumber && <div> Page {pageNumber} </div>}

      {/* Right side: Dropdowns */}
      <div className="flex items-center gap-3">
        {/* Sort Dropdown */}
        <Select
          value={sortValue}
          onValueChange={(v) => onSortChange(v as "pnl" | "roi" | "copied")}
        >
          <SelectTrigger className="w-[150px]">
            <SlidersHorizontal className="w-5 h-5" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pnl">Top PnL</SelectItem>
            <SelectItem value="roi">Top ROI</SelectItem>
            <SelectItem value="copied">Most Copied</SelectItem>
          </SelectContent>
        </Select>

        {/* Time Window Dropdown */}
        <Select
          value={timeWindow}
          onValueChange={(v) =>
            onTimeWindowChange(v as "1d" | "7d" | "30d" | "all")
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">1D</SelectItem>
            <SelectItem value="7d">7D</SelectItem>
            <SelectItem value="30d">30D</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
