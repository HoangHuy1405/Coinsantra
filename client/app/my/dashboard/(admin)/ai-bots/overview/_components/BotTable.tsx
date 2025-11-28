"use client";

import { useCallback, useState } from "react";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { useRouter } from "next/navigation";
import {
  Eye,
  Pencil,
  Pause,
  Play,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import DataTable from "@/app/ui/my_components/data-table/AgDataTable";
import { Button } from "@/app/ui/shadcn/button";
import { Badge, BadgeVariant } from "@/app/ui/shadcn/badge";
import { BotStatus } from "@/services/constants/botConstant";

// FIX: Ensure date-fns import is present
import { format, isValid } from "date-fns";
import { BotResponse } from "@/services/botService";
import { DeleteBotModal } from "./DeleteBotModal";
import { useDeleteBot } from "@/hooks/bot/useBotHook";

interface BotTableProps {
  bots: BotResponse[];
  enableSorting?: boolean;
  enableSearch?: boolean;
  enablePagination?: boolean;
  paginationPageSize?: number;
}

export default function BotTable({
  bots,
  enableSorting = true,
  enableSearch = true,
  enablePagination = false,
  paginationPageSize = 12,
}: BotTableProps) {
  const router = useRouter();
  const { mutate: deleteBot, isPending: isDeleting } = useDeleteBot();
  const [botToDelete, setBotToDelete] = useState<BotResponse | null>(null);

  const handleEdit = useCallback(
    (bot: BotResponse) => {
      router.push(`/my/dashboard/ai-bots/${bot.id}/edit`);
    },
    [router],
  );

  const handleDeleteClick = (bot: BotResponse) => {
    setBotToDelete(bot); // Open Modal
  };
  const handleConfirmDelete = () => {
    if (botToDelete) {
      deleteBot(botToDelete.id, {
        onSuccess: () => {
          setBotToDelete(null); // Close Modal on success
        },
      });
    }
  };

  //TODOS: Handlers (Placeholder logic for now - not yet implements)
  const handlePauseResume = (bot: BotResponse) => console.log("Toggle", bot.id);
  const handleView = (bot: BotResponse) => console.log("View", bot.id);

  const ActionsRenderer = (params: ICellRendererParams<BotResponse>) => {
    const bot = params.data;
    if (!bot) return null;

    return (
      <div className="flex items-center justify-end gap-1 pr-2">
        <Button variant="ghost" size="icon" onClick={() => handleView(bot)}>
          <Eye className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => handleEdit(bot)}>
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePauseResume(bot)}
        >
          {bot.status === "PAUSED" ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-500"
          onClick={() => handleDeleteClick(bot)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const columns: ColDef<BotResponse>[] = [
    {
      headerName: "Bot Name",
      field: "name",
      flex: 1,
      minWidth: 160,
    },
    {
      headerName: "Coin",
      valueGetter: (p) => p.data?.tradingConfig?.coinSymbol,
      width: 90,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="px-2 py-1 rounded-full border text-xs font-medium">
          {params.value}
        </div>
      ),
    },
    {
      headerName: "Status",
      field: "status",
      width: 130,
      sortable: enableSorting,
      cellRenderer: (params: ICellRendererParams<BotResponse>) => {
        const value = params.value as BotStatus;
        const variant: Record<BotStatus, BadgeVariant> = {
          ACTIVE: "positive",
          PAUSED: "warning",
          ERROR: "negative",
        };
        return <Badge variant={variant[value] || "secondary"}>{value}</Badge>;
      },
    },
    {
      headerName: "ROI (24h)",
      valueGetter: (p) => p.data?.stats?.roi24h ?? 0,
      width: 120,
      sortable: enableSorting,
      cellRenderer: (params: ICellRendererParams) => {
        const value = params.value as number;
        const isPositive = value >= 0;
        const color = isPositive ? "text-green-500" : "text-red-500";
        return (
          <div className={`flex items-center gap-1 font-medium ${color}`}>
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            {value.toFixed(2)}%
          </div>
        );
      },
    },
    {
      headerName: "PnL (24h)",
      valueGetter: (p) => p.data?.stats?.pnl24h ?? 0,
      width: 120,
      sortable: enableSorting,
      cellRenderer: (params: ICellRendererParams) => {
        const value = params.value as number;
        const isPositive = value >= 0;
        const color = isPositive ? "text-green-500" : "text-red-500";
        return (
          <div className={`flex items-center gap-1 font-medium ${color}`}>
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        );
      },
    },
    {
      headerName: "Copying Users",
      valueGetter: (p) => p.data?.stats?.copyingUsers ?? 0,
      width: 150,
      sortable: enableSorting,
      cellRenderer: (params: ICellRendererParams) =>
        params.value?.toLocaleString(),
    },
    {
      headerName: "Last Signal",
      // FIX: Use valueGetter to access nested 'stats.lastSignalAt'
      valueGetter: (p) => p.data?.stats?.lastSignalAt,
      flex: 1,
      minWidth: 160,
      valueFormatter: (params) => {
        // FIX: Safely check validity before formatting
        if (!params.value) return "-";
        const date = new Date(params.value);
        // Ensure it's a valid date object
        if (!isValid(date)) return "-";
        return format(date, "MMM dd, HH:mm");
      },
    },
    {
      headerName: "Actions",
      width: 180,
      sortable: false,
      cellRenderer: ActionsRenderer,
    },
  ];

  return (
    <>
      <DataTable<BotResponse>
        title="All Bots"
        columns={columns}
        rowData={bots}
        enableSorting={enableSorting}
        enableSearch={enableSearch}
        enablePagination={enablePagination}
        paginationPageSize={paginationPageSize}
        fallback="No bots found..."
        getRowId={(p) => p.data.id}
      />
      {/* Delete Confirmation Modal */}
      <DeleteBotModal
        isOpen={!!botToDelete}
        onClose={() => setBotToDelete(null)}
        onConfirm={handleConfirmDelete}
        botName={botToDelete?.name || ""}
        isDeleting={isDeleting}
      />
    </>
  );
}
