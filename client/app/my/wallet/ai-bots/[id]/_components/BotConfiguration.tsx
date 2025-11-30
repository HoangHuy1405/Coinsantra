"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/shadcn/card";
import { Button } from "@/app/ui/shadcn/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/ui/shadcn/form";
import { Input } from "@/app/ui/shadcn/input";
import {
  BotSubUpdateSchema,
  BotSubUpdateInputs,
} from "@/services/schemas/botSub";
import { useBotSub } from "@/hooks/bot/useBotSub";
import { BotCopyRequest, BotUpdateRequest } from "@/services/botSubService";

interface BotConfigurationProps {
  subscriptionId: string;
  botWalletCoin: number;
  botWalletBalance: number;
  tradePercentage: number;
  maxDailyLossPercentage: number;
}

export default function BotConfiguration({
  subscriptionId,
  botWalletCoin,
  botWalletBalance,
  tradePercentage,
  maxDailyLossPercentage,
}: BotConfigurationProps) {
  const { updateMutation, isPending } = useBotSub();

  const form = useForm<BotSubUpdateInputs>({
    resolver: zodResolver(BotSubUpdateSchema),
    mode: "onChange",
    defaultValues: {
      botWalletCoin,
      botWalletBalance,
      tradePercentage,
      maxDailyLossPercentage,
    },
  });

  const onSubmit = (values: BotSubUpdateInputs) => {
    const payload: BotUpdateRequest = {
      botWalletBalance:
        typeof values.botWalletBalance === "string"
          ? parseFloat(values.botWalletBalance)
          : values.botWalletBalance,
      botWalletCoin:
        typeof values.botWalletCoin === "string"
          ? parseFloat(values.botWalletCoin)
          : values.botWalletCoin,
      tradePercentage:
        (typeof values.tradePercentage === "string"
          ? parseFloat(values.tradePercentage)
          : values.tradePercentage) / 100,
      maxDailyLossPercentage:
        (typeof values.maxDailyLossPercentage === "string"
          ? parseFloat(values.maxDailyLossPercentage)
          : values.maxDailyLossPercentage) / 100,
    };
    updateMutation.mutate({ id: subscriptionId, payload });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Bot Configuration</CardTitle>
        <p className="text-sm text-muted-foreground">
          Adjust risk and trading parameters
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 py-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="botWalletBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allocated Capital ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1000.00"
                        className="bg-input border-input
                          focus-visible:ring-ring"
                        {...field}
                        value={field.value as string | number}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-destructive font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="botWalletCoin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allocated Coin</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="0.5"
                        className="bg-input border-input
                          focus-visible:ring-ring"
                        {...field}
                        value={field.value as string | number}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-destructive font-medium" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tradePercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trade Size (%)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          max={100}
                          className="pr-8 bg-input border-input"
                          {...field}
                          value={field.value as string | number}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                        <span
                          className="absolute right-3 top-2 text-sm
                            text-muted-foreground"
                        >
                          %
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      % of capital per trade
                    </FormDescription>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxDailyLossPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Daily Loss (%)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          max={100}
                          className="pr-8 bg-input border-input"
                          {...field}
                          value={field.value as string | number}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                        <span
                          className="absolute right-3 top-2 text-sm
                            text-muted-foreground"
                        >
                          %
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Stop trading if loss hits
                    </FormDescription>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary text-primary-foreground
                  hover:bg-primary/90"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
