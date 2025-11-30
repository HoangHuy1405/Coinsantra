"use client";

import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Accept either pnl or totalPnl property
type ChartDataPoint = {
  timestamp: string;
  pnl?: number;
  totalPnl?: number;
};

interface PnLLineChartProps {
  chartData: ChartDataPoint[];
  timeframe: "current" | "1d" | "7d";
  height?: string;
}

export default function PnLLineChart({
  chartData,
  timeframe,
  height = "350px",
}: PnLLineChartProps) {
  const series = [
    {
      name: "PnL",
      data: chartData.map((point) => ({
        x: new Date(point.timestamp).getTime(),
        y: point.pnl ?? point.totalPnl ?? 0,
      })),
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "line",
      background: "transparent",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "datetime",
      labels: {
        format: timeframe === "1d" ? "HH:mm" : "MMM dd",
        style: {
          colors: "#9ca3af",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => `$${val.toFixed(0)}`,
        style: {
          colors: "#9ca3af",
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: "#1e293b",
      strokeDashArray: 3,
    },
    colors: ["#3b82f6"],
    tooltip: {
      theme: "dark",
      x: {
        format: "MMM dd, HH:mm",
      },
      y: {
        formatter: (val) => `$${val.toFixed(2)}`,
      },
    },
  };

  return (
    <div className="w-full" style={{ height }}>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height="100%"
      />
    </div>
  );
}
