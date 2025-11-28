import { useBotService } from "@/services/botService";
import { BotFormInputs } from "@/services/schemas/bot";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// --- Fetch All Bots ---
export function useAllBots() {
  const botService = useBotService();

  return useQuery({
    queryKey: ["bots"],
    queryFn: () => botService.getAllBots(),
    staleTime: 0, // Cache list for 10 seconds
    refetchOnMount: true,
  });
}
// --- Fetch Hook ---
export function useBotForEdit(botId: string) {
  const botService = useBotService();

  return useQuery({
    queryKey: ["bot", botId],
    queryFn: () => botService.getBotForEdit(botId),
    enabled: !!botId, // Only run if ID is present
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });
}

// --- Update Hook ---
export function useUpdateBot() {
  const botService = useBotService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BotFormInputs }) =>
      botService.updateBot(id, data),

    onSuccess: async (data) => {
      toast.success(`Bot "${data.name}" updated successfully!`);
      // Invalidate specific bot and the list
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["bot", data.id] }),
        queryClient.invalidateQueries({ queryKey: ["bots"] }),
      ]);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || error.message || "Update failed";
      toast.error(msg);
    },
  });
}

export function useDeleteBot() {
  const botService = useBotService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (botId: string) => botService.deleteBot(botId),

    onSuccess: async () => {
      toast.success("Bot deleted successfully");
      // Refresh the list
      await queryClient.invalidateQueries({ queryKey: ["bots"] });
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || error.message || "Delete failed";
      toast.error(msg);
    },
  });
}
