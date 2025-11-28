"use client";

import { Label } from "@/app/ui/shadcn/label";
import { Input } from "@/app/ui/shadcn/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/ui/shadcn/select";
import { SectionCard } from "@/app/ui/my_components/Card/SectionCard";
import { UseFormReturn, Controller } from "react-hook-form";
import { SYMBOLS, COIN_LOGOS } from "@/services/constants/coinConstant";
import { BotFormInputs } from "@/services/schemas/bot";

interface Props {
  form: UseFormReturn<BotFormInputs>;
}

export function TradingConfigurationSection({ form }: Props) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  return (
    <SectionCard title="Trading Configuration">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Coin Symbol (Required, uses Controller for Select) */}
        <div className="space-y-2">
          <Label htmlFor="coinSymbol">Coin Symbol</Label>
          <Controller
            control={control}
            name="coinSymbol"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                // FIX: Ensure value is never undefined to prevent uncontrolled component warnings
                value={field.value || ""}
              >
                <SelectTrigger id="coinSymbol" className="h-11">
                  <SelectValue placeholder="Select coin" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {SYMBOLS.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      <div className="flex items-center gap-3">
                        {/* Safe Image rendering with fallback */}
                        {COIN_LOGOS[symbol] ? (
                          <img
                            src={COIN_LOGOS[symbol]}
                            alt={symbol}
                            className="h-5 w-5 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div
                            className="h-5 w-5 rounded-full bg-muted flex
                              items-center justify-center text-[10px]"
                          >
                            {symbol[0]}
                          </div>
                        )}
                        <span className="font-medium">{symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.coinSymbol && (
            <p className="text-sm text-red-500">{errors.coinSymbol.message}</p>
          )}
        </div>

        {/* Trading Pair (Optional, uses register for Input) */}
        <div className="space-y-2">
          <Label htmlFor="tradingPair">Trading Pair</Label>
          <Input
            id="tradingPair"
            className="h-11"
            placeholder="BTC/USDT"
            {...register("tradingPair")}
          />
          {errors.tradingPair && (
            <p className="text-sm text-red-500">{errors.tradingPair.message}</p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
