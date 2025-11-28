"use client";

import { Card } from "@/app/ui/shadcn/card";
import { Button } from "@/app/ui/shadcn/button";
import { RefreshCw, Pause, Play, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { BotStatus } from "@/services/constants/botConstant";

interface Props {
  botName: string;
  botStatus: BotStatus;
  copyingUsers?: number;

  onResetApi: () => void;
  onPauseResume: () => void;
  onDelete: () => void;
}

export const EditQuickActions = ({
  botName,
  botStatus,
  copyingUsers,
  onResetApi,
  onPauseResume,
  onDelete,
}: Props) => {
  return (
    <Card className="border border-border bg-card p-6">
      <h2 className="mb-4">Quick Actions</h2>

      <div className="flex flex-wrap gap-3">
        {/* Reset API Key */}
        <Button variant="outline" onClick={onResetApi} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset API Key
        </Button>

        {/* Pause / Resume */}
        <Button
          variant={botStatus === "ACTIVE" ? "secondary" : "default"}
          onClick={onPauseResume}
          className="gap-2"
        >
          {botStatus === "ACTIVE" ? (
            <>
              <Pause className="h-4 w-4" />
              Pause Bot
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Resume Bot
            </>
          )}
        </Button>

        {/* Delete */}
        <Button variant="destructive" onClick={onDelete} className="gap-2">
          <Trash2 className="h-4 w-4" />
          Delete Bot
        </Button>
      </div>
    </Card>
  );
};
