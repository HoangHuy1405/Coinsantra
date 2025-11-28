"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/shadcn/select";
import { Button } from "@/app/ui/shadcn/button";

import { useRouter } from "next/navigation";
import { BotStatus } from "@/services/constants/botConstant";

interface BotFilterBarProps {
  uniqueCoins: string[];
  coinFilter: string;
  statusFilter: BotStatus;
  sortBy: string;

  onCoinChange: (coin: string) => void;
  onStatusChange: (status: BotStatus) => void;
  onSortChange: (sort: string) => void;
}

export function BotFilterBar({
  uniqueCoins,
  coinFilter,
  statusFilter,
  sortBy,
  onCoinChange,
  onStatusChange,
  onSortChange,
}: BotFilterBarProps) {
  const router = useRouter();
  const handleCreateBot = () => {
    router.push("/my/dashboard/ai-bots/create");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      {/* Left Side: Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Coin Filter */}
        <Select value={coinFilter} onValueChange={onCoinChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Coin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Coins</SelectItem>
            {uniqueCoins.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusChange(v as BotStatus)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Menu */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px]">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="copying-users">Copying Users</SelectItem>
            <SelectItem value="roi-24h">ROI (24h)</SelectItem>
            <SelectItem value="pnl-24h">PnL (24h)</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Right Side: Create Bot Button */}
      <Button onClick={handleCreateBot} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Create Bot
      </Button>
    </div>
  );
}
