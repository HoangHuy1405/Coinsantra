"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/app/ui/shadcn/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/ui/shadcn/card";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ranges = ["Monthly", "Quarterly", "Annually"] as const;
type Range = (typeof ranges)[number];


interface PortfolioPerformanceChartProps {
    data: { month: string; totalValue: number }[];
    title?: string;
}

export default function PortfolioPerformanceChart({
    data,
    title = "Portfolio Performance",
}: PortfolioPerformanceChartProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [range, setRange] = React.useState<Range>("Monthly");

    const series = [
        {
            name: "Portfolio Value",
            data: data.map((d) => d.totalValue / 1000), // normalize
        },
    ];

    const options: ApexCharts.ApexOptions = {
        chart: {
            type: "area",
            background: "transparent",
            toolbar: { show: false },
        },
        theme: { mode: isDark ? "dark" : "light" },
        stroke: { curve: "smooth", width: 2 },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 90, 100],
            },
        },
        grid: {
            borderColor: isDark ? "#1e293b" : "#e5e7eb",
            strokeDashArray: 3,
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: data.map((d) => d.month),
            labels: {
                style: { colors: isDark ? "#9ca3af" : "#6b7280", fontSize: "12px" },
            },
        },
        yaxis: {
            labels: {
                formatter: (val) => `${val.toFixed(1)}k`,
                style: { colors: isDark ? "#9ca3af" : "#6b7280", fontSize: "12px" },
            },
        },
        colors: [isDark ? "#60a5fa" : "#3b82f6"],
        tooltip: {
            theme: isDark ? "dark" : "light",
            y: { formatter: (val) => `$${(val * 1000).toLocaleString()}` },
        },
    };

    return (
        <Card>
            <CardHeader className="flex flex-col gap-5 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="text-lg font-semibold">
                        {title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">
                        Here is your performance stats of each month
                    </CardDescription>
                </div>

                <div className="flex items-center gap-0.5 rounded-lg p-0.5">
                    {ranges.map((r) => (
                        <Button
                            key={r}
                            variant="subtle"
                            className={
                                cn(range === r ? "shadow-sm text-foreground"
                                    : "shadow-sm text-muted-foreground hover:text-foreground")
                            }
                            onClick={() => setRange(r)}
                        >
                            {r}
                        </Button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="max-w-full overflow-x-auto overflow-hidden">
                <div className="min-w-[900px] pl-2">
                    <ReactApexChart key={theme} options={options} series={series} type="area" height={350} />
                </div>
            </CardContent>
        </Card>
    );
}
