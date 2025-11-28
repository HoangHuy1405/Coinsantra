"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/app/ui/shadcn/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { BasicInformationSection } from "../../../create/_components/BasicInformationSection";
import { TradingConfigurationSection } from "../../../create/_components/TradingConfigurationSection";
import { EngineSettingsSection } from "../../../create/_components/EngineSettingsSection";
import { BotCategory, RiskLevel } from "@/services/constants/botConstant";
import {
  useUpdateBot,
  useBotForEdit,
  useDeleteBot,
} from "@/hooks/bot/useBotHook";
import { BotResponse } from "@/services/botService";
import { BotFormInputs, BotFormSchema } from "@/services/schemas/bot";
import { EditQuickActions } from "./EditQuickActions";
import { EditStatistics } from "./EditStatistics";
import { useState } from "react";
import { DeleteBotModal } from "../../../overview/_components/DeleteBotModal";

function BotEditForm({ bot, botId }: { bot: BotResponse; botId: string }) {
  const router = useRouter();
  const { mutate: updateBot, isPending: isSaving } = useUpdateBot();

  // Helper để map dữ liệu an toàn (Defensive Coding)
  // Ép kiểu any tạm để fallback cho trường hợp backend trả về cấu trúc cũ
  const safeBot = bot as any;

  const initialValues: BotFormInputs = {
    name: bot.name,
    description: bot.description || "",
    category: (bot.category as BotCategory) || "AI_PREDICTIVE",

    // Map Coin Symbol: Ưu tiên tradingConfig -> fallback coinSymbol cũ -> rỗng
    coinSymbol: bot.tradingConfig?.coinSymbol || safeBot.coinSymbol || "",

    tradingPair: bot.tradingConfig?.tradingPair || safeBot.tradingPair || "",
    riskLevel: (bot.tradingConfig?.riskLevel as RiskLevel) || "LOW",

    websocketUrl:
      bot.integrationConfig?.websocketUrl || safeBot.websocketUrl || "",
    healthUrl:
      bot.integrationConfig?.healthCheckUrl || safeBot.healthCheckUrl || "",
  };

  // Khởi tạo form với dữ liệu CÓ SẴN (Không cần useEffect reset)
  const form = useForm<BotFormInputs>({
    resolver: zodResolver(BotFormSchema),
    defaultValues: initialValues, // Form nhận giá trị đúng ngay lập tức
  });

  const onSubmit = (data: BotFormInputs) => {
    updateBot(
      { id: botId, data },
      {
        onSuccess: () => {
          // Redirect back to overview on success
          router.refresh();
          router.push("/my/dashboard/ai-bots/overview");
        },
      },
    );
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <BasicInformationSection form={form} />
      <TradingConfigurationSection form={form} />
      <EngineSettingsSection form={form} />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/my/dashboard/ai-bots/overview")}
          disabled={isSaving}
        >
          Cancel
        </Button>

        <Button type="submit" size="lg" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}

// --- PHẦN 2: CONTAINER COMPONENT (Load Data) ---
interface Props {
  botId: string;
}

export default function AdminBotEdit({ botId }: Props) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: bot, isLoading, isError } = useBotForEdit(botId);
  const { mutate: deleteBot, isPending: isDeleting } = useDeleteBot();

  const handleBackToList = () => {
    router.push("/my/dashboard/ai-bots/overview");
  };

  const handleDeleteConfirm = () => {
    deleteBot(botId, {
      onSuccess: () => {
        // Modal closes automatically via navigation, but good practice to close state
        setIsDeleteModalOpen(false);
        router.push("/my/dashboard/ai-bots/overview");
      },
    });
  };

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 3. Error State
  if (isError || !bot) {
    return (
      <div className="flex flex-col items-center gap-4 pt-10">
        <p className="text-red-500">Failed to load bot details.</p>
        <Button onClick={handleBackToList}>Back to List</Button>
      </div>
    );
  }

  // 4. Render UI
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBackToList} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Bots
        </Button>
      </div>

      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Edit Bot: {bot.name}</h1>
          <p className="text-muted-foreground">
            Update configuration for ID:{" "}
            <span className="font-mono text-xs">{botId}</span>
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <EditQuickActions
        botName={bot.name}
        botStatus={bot.status}
        copyingUsers={bot.stats?.copyingUsers ?? 0}
        onResetApi={() => toast.success("Coming soon")}
        onPauseResume={() => toast.success("Coming soon")}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      {/* Statistics Section */}
      <EditStatistics
        createdAt={bot.createdAt}
        totalTrades={bot.stats?.totalTrades ?? 0}
        uptime={bot.stats?.uptime ?? 0}
        copyingUsers={bot.stats?.copyingUsers ?? 0}
      />

      {/* QUAN TRỌNG: Truyền dữ liệu xuống component con */}
      {/* BotEditForm chỉ được mount khi 'bot' đã tồn tại */}
      <BotEditForm bot={bot} botId={botId} />

      {/* Delete Confirmation Modal */}
      <DeleteBotModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        botName={bot.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
