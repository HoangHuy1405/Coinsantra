import {
  useBotSubService,
  BotCopyRequest,
  BotUpdateRequest,
} from "@/services/botSubService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useBotSub() {
  const botSubService = useBotSubService();
  const queryClient = useQueryClient();

  // Mutation for creating a new subscription
  const createMutation = useMutation({
    mutationFn: (data: BotCopyRequest) => botSubService.copyBot(data),
    onSuccess: () => {
      toast.success("Bot copied successfully");
      queryClient.invalidateQueries({ queryKey: ["user-subscriptions"] });
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
    mutationFn: ({ id, payload }: { id: string; payload: BotUpdateRequest }) =>
      botSubService.updateBotSub(id, payload),
    onSuccess: () => {
      toast.success("Configuration updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-detail"] });
    },
    onError: (error: any) => {
      console.error("Update Bot Error:", error);
      const msg =
        error?.response?.data?.message || "Failed to update configuration";
      toast.error(msg);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enable }: { id: string; enable: boolean }) =>
      botSubService.toggleBotSubscriptionStatus(id, enable),
    onSuccess: () => {
      toast.success("Bot status toggled successfully");
      queryClient.invalidateQueries({ queryKey: ["user-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-detail"] });
    },
    onError: (error: any) => {
      console.error("Toggle Bot Status Error:", error);
      const msg =
        error?.response?.data?.message || "Failed to toggle bot status";
      toast.error(msg);
    },
  });

  return {
    createMutation,
    updateMutation,
    toggleMutation,
    isPending: createMutation.isPending || updateMutation.isPending,
  };
}
