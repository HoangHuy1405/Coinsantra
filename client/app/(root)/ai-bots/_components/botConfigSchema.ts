import { z } from "zod";

// Fixed schema: Removed the arguments from z.coerce.number() to resolve the TS error.
// Validation logic is handled by the chained methods (.positive, .min, .max).
export const botConfigSchema = z.object({
  botId: z.string().uuid(),

  allocatedAmount: z.coerce
    .number()
    .positive({ message: "Allocated amount must be greater than 0" }),

  allocatedCoin: z.coerce
    .number()
    .positive({ message: "Allocated coin must be greater than 0" }),

  tradePercentage: z.coerce
    .number()
    .min(1, { message: "Trade percentage must be at least 1%" })
    .max(100, { message: "Trade percentage cannot exceed 100%" }),

  maxDailyLossPercentage: z.coerce
    .number()
    .min(1, { message: "Max daily loss must be at least 1%" })
    .max(100, { message: "Max daily loss cannot exceed 100%" }),
});

export type BotConfigFormValues = z.infer<typeof botConfigSchema>;
