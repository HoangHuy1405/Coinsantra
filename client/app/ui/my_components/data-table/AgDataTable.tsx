"use client";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef, ModuleRegistry } from "ag-grid-community";

import { Input } from "@/app/ui/shadcn/input";

ModuleRegistry.registerModules([AllCommunityModule]);

export interface DataTableProps<T extends object> {
  title?: React.ReactNode;
  columns: ColDef<T>[];
  rowData: T[];

  showLimit?: number; // -1 = unlimited, use pagination
  enableSearch?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  paginationPageSize?: number;

  fallback?: string;
  getRowId?: (params: { data: T }) => string;
}

export function DataTable<T extends object>({
  title,
  columns,
  rowData,
  showLimit = -1,
  enableSearch = false,
  enableSorting = true,
  enablePagination = false,
  paginationPageSize = 12,
  fallback = "Loading...",
  getRowId,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");

  const isUnlimited = showLimit === -1;

  // Computed rows
  const visibleRows = useMemo(() => {
    if (isUnlimited) return rowData;
    return rowData.slice(0, showLimit);
  }, [rowData, showLimit, isUnlimited]);

  const defaultColDef = useMemo<ColDef<T>>(
    () => ({
      resizable: true,
      sortable: enableSorting,
      filter: false,
    }),
    [enableSorting],
  );

  // Height auto calculation
  const height = isUnlimited
    ? 580 // big table
    : Math.max(visibleRows.length * 65 + 70, 180); // small table

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Header Toolbar */}
      <div
        className="flex items-center justify-between p-4 border-b
          border-border/50"
      >
        {title && <div className="text-lg font-semibold px-2">{title}</div>}

        {enableSearch && (
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        )}
      </div>

      {/* Loading Fallback */}
      {rowData.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground">{fallback}</div>
      ) : (
        <div
          className="ag-theme-quartz"
          style={{
            width: "100%",
            height,
          }}
        >
          <AgGridReact<T>
            rowData={visibleRows}
            columnDefs={columns}
            defaultColDef={defaultColDef}
            quickFilterText={enableSearch ? search : undefined}
            animateRows={true}
            suppressCellFocus={true}
            getRowId={getRowId}
            pagination={isUnlimited && enablePagination}
            paginationPageSize={paginationPageSize}
            rowHeight={60}
            headerHeight={58}
            paginationPageSizeSelector={false} //always false
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;
