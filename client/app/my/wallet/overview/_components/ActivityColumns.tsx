"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/app/ui/shadcn/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Activity = {
  id: number;
  time: string;
  action: "Buy" | "Sell";
  coin: string;
  amount: number;
  price: number;
  status: "completed" | "pending";
};

export const activityColumns: ColumnDef<Activity>[] = [
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.original.time}</div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const { action } = row.original;
      return (
        <Badge
          variant={action === "Buy" ? "default" : "secondary"}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5",
            action === "Buy"
              ? "bg-emerald-500/20 text-emerald-600"
              : "bg-rose-500/20 text-rose-600",
          )}
        >
          {action}
          {action === "Buy" ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
        </Badge>
      );
    },
  },
  {
    accessorKey: "coin",
    header: "Coin",
    cell: ({ row }) => <span className="font-medium">{row.original.coin}</span>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => row.original.amount,
  },
  {
    accessorKey: "price",
    header: "Price (USD)",
    cell: ({ row }) => `$${row.original.price.toLocaleString()}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { status } = row.original;
      return (
        <Badge
          variant="outline"
          className={cn(
            "capitalize px-2 py-0.5",
            status === "completed"
              ? "border-emerald-500 text-emerald-600"
              : "border-yellow-500 text-yellow-600",
          )}
        >
          {status}
        </Badge>
      );
    },
  },
];
