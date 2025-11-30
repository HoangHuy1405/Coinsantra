import { z } from "zod";

export const BotSubUpdateSchema = z.object({
  botWalletCoin: z.number().positive("Coin amount is required"),
  botWalletBalance: z
    .number()
    .positive("Balance must be greater than 0")
    .or(z.string().min(1, "Balance is required")),
  tradePercentage: z
    .number()
    .positive("Trade percentage must be greater than 0")
    .max(100),
  maxDailyLossPercentage: z
    .number()
    .positive("Max daily loss must be greater than 0")
    .max(100),
});

export type BotSubUpdateInputs = z.infer<typeof BotSubUpdateSchema>;
