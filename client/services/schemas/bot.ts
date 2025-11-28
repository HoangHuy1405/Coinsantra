import { z } from "zod";
import { BOT_CATEGORIES, RISK_LEVELS } from "../constants/botConstant";

// --- Schema for the entire Form Data ---
export const BotFormSchema = z.object({
  // BotCreateRequest Fields (Required for Java DTO)
  name: z.string().min(1, "Bot Name is required."),
  coinSymbol: z.string().min(1, "Trading Coin Symbol is required (e.g., BTC)."),
  category: z.enum(BOT_CATEGORIES),
  riskLevel: z.enum(RISK_LEVELS),

  // Optional fields for BotCreateRequest
  tradingPair: z.string().optional(),
  description: z.string().optional(),

  // Optional fields on the main Bot entity
  websocketUrl: z
    .string()
    .url("Must be a valid URL.")
    .optional()
    .or(z.literal("")),
  healthUrl: z
    .string()
    .url("Must be a valid URL.")
    .optional()
    .or(z.literal("")),
});

export type BotFormInputs = z.infer<typeof BotFormSchema>;
