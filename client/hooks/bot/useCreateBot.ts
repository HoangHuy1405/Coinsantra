import { useBotService } from "@/services/botService";
import { BotSecretResponse } from "@/services/interfaces/botInterfaces";
import { BotFormInputs } from "@/services/schemas/bot";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useCreateBot() {
  const botService = useBotService();
  const queryClient = useQueryClient();

  return useMutation<BotSecretResponse, Error, BotFormInputs>({
    mutationKey: ["createBot"],

    mutationFn: async (data: BotFormInputs) => {
      return await botService.createBot(data);
    },

    onSuccess: async (data) => {
      // 1. Show success message
      toast.success(`Bot "${data.name}" created successfully!`);

      // 2. Invalidate the bot list query so the main dashboard refreshes automatically
      // (Assuming your list hook uses the key ["bots", "list"] or similar)
      await queryClient.invalidateQueries({ queryKey: ["bots"] });
    },

    onError: (error: any) => {
      console.error("Failed to create bot:", error);

      // Try to extract a specific message from the backend error response
      const backendMessage =
        error?.response?.data?.detail || error.message || "Unknown error";
      toast.error(`Creation failed: ${backendMessage}`);
    },
  });
}
