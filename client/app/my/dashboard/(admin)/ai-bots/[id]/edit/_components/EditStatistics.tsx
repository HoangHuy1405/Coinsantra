"use client";

import { Card } from "@/app/ui/shadcn/card";
import { formatDate } from "@/lib/utils";

interface Props {
  createdAt: string;
  totalTrades: number;
  uptime: number;
  copyingUsers: number;
}

export const EditStatistics = ({
  createdAt,
  totalTrades,
  uptime,
  copyingUsers,
}: Props) => {
  return (
    <Card className="border border-border bg-card p-6">
      <h2 className="mb-6">Bot Statistics</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-muted p-4">
          <p className="text-xs text-muted-foreground mb-1">Created</p>
          <p>{formatDate(createdAt)}</p>
        </div>

        <div className="rounded-lg border border-border bg-muted p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Trades</p>
          <p>{totalTrades.toLocaleString()}</p>
        </div>

        <div className="rounded-lg border border-border bg-muted p-4">
          <p className="text-xs text-muted-foreground mb-1">Uptime</p>
          <p className={uptime >= 95 ? "text-green-400" : "text-red-400"}>
            {uptime.toFixed(1)}%
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted p-4">
          <p className="text-xs text-muted-foreground mb-1">Users Copying</p>
          <p>{copyingUsers.toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
};
