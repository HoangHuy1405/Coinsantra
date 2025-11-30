"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/ui/shadcn/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BotFormInputs, BotFormSchema } from "@/services/schemas/bot";
import { BasicInformationSection } from "./_components/BasicInformationSection";
import { EngineSettingsSection } from "./_components/EngineSettingsSection";
import { TradingConfigurationSection } from "./_components/TradingConfigurationSection";
import { useCreateBot } from "@/hooks/bot/useCreateBot";
import { BotSecretsDialog } from "./_components/BotSecretsDialog";
import { BotSecretResponse } from "@/services/interfaces/botInterfaces";

export default function AdminBotCreatePage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateBot();

  // State to hold the secrets when bot is successfully created
  const [createdBotData, setCreatedBotData] =
    useState<BotSecretResponse | null>(null);

  // --- 1. Initialize React Hook Form ---
  const form = useForm<BotFormInputs>({
    resolver: zodResolver(BotFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "AI_PREDICTIVE",
      riskLevel: "LOW",
      coinSymbol: "",
      tradingPair: "",
      websocketUrl: "",
      healthUrl: "",
    },
  });

  const handleBackToList = () => {
    router.push("/my/dashboard/ai-bots/overview");
  };

  // Handler to close modal and redirect
  const handleSecretsDialogClose = () => {
    setCreatedBotData(null);
    router.refresh();
    router.push("/my/dashboard/ai-bots/overview");
  };

  // --- 2. RHF Submission Handler ---
  const onSubmit = (data: BotFormInputs) => {
    // 3. Prepare Payload
    const apiPayload = {
      name: data.name,
      coinSymbol: data.coinSymbol,
      description: data.description,
      tradingPair: data.tradingPair,
      category: data.category,
      riskLevel: data.riskLevel,
      websocketUrl: data.websocketUrl || null,
      healthCheckUrl: data.healthUrl || null,
    };

    // 4. Trigger Mutation
    mutate(apiPayload as any, {
      onSuccess: (result: BotSecretResponse) => {
        console.log("Bot Creation Success (Secrets):", result);

        // DO NOT Redirect here.
        // Instead, save data to state to trigger the Modal popup.
        setCreatedBotData(result);

        toast.success("Bot created successfully! Please save credentials.");
      },
      // onError is handled in the hook
    });
  };

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Button
          variant="ghost"
          onClick={handleBackToList}
          className="gap-2"
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bot List
        </Button>

        <BasicInformationSection form={form} />
        <TradingConfigurationSection form={form} />
        <EngineSettingsSection form={form} />

        {form.formState.errors.root?.message && (
          <p className="text-red-500">{form.formState.errors.root.message}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleBackToList}
            disabled={isPending}
            type="button"
          >
            Cancel
          </Button>
          <Button size="lg" type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Bot"}
          </Button>
        </div>
      </form>

      {/* Display the Secrets Modal when data exists */}
      <BotSecretsDialog
        open={!!createdBotData}
        data={createdBotData}
        onClose={handleSecretsDialogClose}
      />
    </>
  );
}
