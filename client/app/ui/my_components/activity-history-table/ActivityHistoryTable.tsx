"use client";

import React from "react";
import { DataTable } from "@/app/ui/my_components/data-table/data-table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/app/ui/shadcn/card";
import { Button } from "@/app/ui/shadcn/button";
import { useRouter } from "next/navigation";
import {
  Activity,
  activityColumns,
} from "@/app/my/wallet/overview/_components/ActivityColumns";

interface ActivityHistoryTableProps {
  data: Activity[];
  variant?: "overview" | "full";
  title?: string;
  subtitle?: string;
}

export default function ActivityHistoryTable({
  data,
  variant = "overview",
  title,
  subtitle,
}: ActivityHistoryTableProps) {
  const router = useRouter();

  const displayed = variant === "overview" ? data.slice(0, 5) : data;

  return (
    <Card className="h-full w-full border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {subtitle}
          </CardDescription>
        </div>

        {variant === "overview" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/activities")}
          >
            View All
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <DataTable
          title=""
          columns={activityColumns}
          data={displayed}
          showSearch={variant === "full"}
          showPagination={variant === "full"}
        />
      </CardContent>
    </Card>
  );
}
