import { useBotSubService, BotCopyRequest } from "@/services/botSubService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface UseBotMutationsProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function useBotSub({ onSuccess, onClose }: UseBotMutationsProps = {}) {
  const botSubService = useBotSubService();
  const queryClient = useQueryClient();

  // Mutation for creating a new subscription
  const createMutation = useMutation({
    mutationFn: (data: BotCopyRequest) => botSubService.copyBot(data),
    onSuccess: () => {
      toast.success("Bot copied successfully");
      queryClient.invalidateQueries({ queryKey: ["bot-subscriptions"] });
      onSuccess?.();
      onClose?.();
    },
    onError: (error: any) => {
      console.error("Create Bot Error:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Failed to copy bot strategy";
      toast.error(msg);
    },
  });

  // Mutation for updating an existing subscription
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BotCopyRequest }) =>
      botSubService.updateBotSub(id, payload),
    onSuccess: () => {
      toast.success("Configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bot-subscriptions"] });
      onSuccess?.();
      onClose?.();
    },
    onError: (error: any) => {
      console.error("Update Bot Error:", error);
      const msg =
        error?.response?.data?.message || "Failed to update configuration";
      toast.error(msg);
    },
  });

  return {
    createMutation,
    updateMutation,
    isPending: createMutation.isPending || updateMutation.isPending,
  };
}
