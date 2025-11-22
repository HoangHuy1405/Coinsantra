"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

import { ColDef, ICellRendererParams } from "ag-grid-community";
import { ArrowUpRight, ArrowDownRight, Info, TrendingUp } from "lucide-react";

import { Button } from "@/app/ui/shadcn/button";

import {
  useLiveMarketStream,
  MarketTicker,
} from "@/hooks/ws/useLiveMarketStream";

import { MarketSparkline } from "../charts/MarketSparkline";
import { COIN_LOGOS } from "../../widgets/constant";
import DataTable from "../data-table/AgDataTable";

interface MarketTableProps {
  symbols: string[];
  showLimit?: number; // -1 = unlimited big table
  enableChart?: boolean;
  enableActions?: boolean;
  enableSorting?: boolean;
  enableSearch?: boolean;
  enablePagination?: boolean;
}

type Row = MarketTicker;

export function MarketTable({
  symbols,
  showLimit = 10,
  enableChart = false,
  enableActions = true,
  enableSorting = true,
  enableSearch = true,
  enablePagination = false,
}: MarketTableProps) {
  const tickers = useLiveMarketStream(symbols);

  const rowData = useMemo<Row[]>(() => {
    return Object.values(tickers).sort(
      (a, b) => b.changePercent - a.changePercent,
    );
  }, [tickers]);

  const columns = useMemo<ColDef<Row>[]>(() => {
    const cols: ColDef<Row>[] = [
      {
        headerName: "Coin",
        field: "symbol",
        sortable: enableSorting,
        flex: 1,
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams<Row>) => {
          const symbol = params.data?.symbol.toUpperCase() ?? "";
          const logoSrc =
            COIN_LOGOS[symbol] ??
            `https://ui-avatars.com/api/?name=${encodeURIComponent(symbol)}`;

          return (
            <div className="flex items-center gap-3">
              <Image
                src={logoSrc}
                alt={symbol}
                width={26}
                height={26}
                className="rounded-full"
              />
              <span className="font-medium">{symbol}</span>
            </div>
          );
        },
      },
      {
        headerName: "Price (USDT)",
        field: "price",
        sortable: enableSorting,
        flex: 1,
        minWidth: 140,
        cellClass: "font-semibold",
        valueFormatter: (params) =>
          params.value == null
            ? ""
            : Number(params.value).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            }),
      },
      {
        headerName: "Change (24h)",
        field: "changePercent",
        sortable: enableSorting,
        sort: "desc",
        sortIndex: 0,
        flex: 1,
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams<Row>) => {
          const change = params.data?.changePercent ?? 0;
          const isPositive = change >= 0;
          return (
            <div
              className={`flex items-center gap-1 font-medium ${isPositive ? "text-green-500" : "text-red-500"
                }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {change.toFixed(2)}%
            </div>
          );
        },
      },
    ];

    if (enableChart) {
      cols.push({
        headerName: "Chart",
        field: "history",
        minWidth: 150,
        flex: 1,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<Row>) => (
          <MarketSparkline
            data={params.data?.history ?? []}
            isPositive={(params.data?.changePercent ?? 0) >= 0}
          />
        ),
      });
    }

    if (enableActions) {
      cols.push({
        headerName: "Actions",
        field: "symbol",
        minWidth: 120,
        maxWidth: 140,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<Row>) => {
          const s = params.data?.symbol.toLowerCase() ?? "";
          return (
            <div className="flex items-center gap-2">
              <Link href={`/market/${s}`}>
                <Button size="icon" variant="ghost">
                  <Info className="w-4 h-4" />
                </Button>
              </Link>

              <Link href={`/market/${s}/trade`}>
                <Button size="icon" variant="ghost">
                  <TrendingUp className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          );
        },
      });
    }

    return cols;
  }, [enableSorting, enableChart, enableActions]);

  // showLimit is = -1 (unlimit) => then no need to show more
  // showLimit exists (no pagination) => add a button to view more
  const title =
    showLimit !== -1 ? (
      <div className="flex items-center gap-3">
        <div> Live Market </div>
        <Link href="/market">
          <Button size="sm" variant="outline">
            View More
          </Button>
        </Link>
      </div>
    ) : (
      "Live Market"
    );

  return (
    <DataTable<Row>
      title={title}
      columns={columns}
      rowData={rowData}
      showLimit={showLimit}
      enableSearch={enableSearch}
      enableSorting={enableSorting}
      enablePagination={enablePagination}
      paginationPageSize={12}
      fallback="Loading market data..."
      getRowId={(p) => p.data.symbol}
    />
  );
}
