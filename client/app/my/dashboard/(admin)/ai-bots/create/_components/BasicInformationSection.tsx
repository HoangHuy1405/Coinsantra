"use client";

import { Label } from "@/app/ui/shadcn/label";
import { Input } from "@/app/ui/shadcn/input";
import { Textarea } from "@/app/ui/shadcn/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/ui/shadcn/select";
import { SectionCard } from "@/app/ui/my_components/Card/SectionCard";
import { BotFormInputs } from "@/services/schemas/bot";
import { useForm, Controller, UseFormReturn } from "react-hook-form";
import { RISK_LEVELS } from "@/services/constants/botConstant";

interface Props {
  form: UseFormReturn<BotFormInputs>;
}

export function BasicInformationSection({ form }: Props) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  return (
    <SectionCard title="Basic Information">
      <div className="flex flex-col gap-6 md:flex-row md:gap-4">
        {/* 1. Bot Name: 50% width */}
        <div className="space-y-2 w-full md:w-1/2">
          <Label htmlFor="name">Bot Name *</Label>
          <Input
            id="name"
            placeholder="Alpha Trend Pro"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* 2. Category: 25% width */}
        <div className="space-y-2 w-full md:w-1/4">
          <Label htmlFor="category">Category *</Label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI_PREDICTIVE">AI Predictive</SelectItem>
                  <SelectItem value="TREND_FOLLOWING">
                    Trend Following
                  </SelectItem>
                  <SelectItem value="DCA">
                    Dollar Cost Averaging (DCA)
                  </SelectItem>
                  <SelectItem value="SCALPING">Scalping</SelectItem>
                  <SelectItem value="GRID_TRADING">Grid Trading</SelectItem>
                  <SelectItem value="MEAN_REVERSION">Mean Reversion</SelectItem>
                  <SelectItem value="ARBITRAGE">Arbitrage</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>

        {/* 3. Risk Level: 25% width */}
        <div className="space-y-2 w-full md:w-1/4">
          <Label htmlFor="riskLevel">Risk Level *</Label>
          <Controller
            control={control}
            name="riskLevel"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="riskLevel" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {RISK_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.riskLevel && (
            <p className="text-sm text-red-500">{errors.riskLevel.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the bot strategy…"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>
    </SectionCard>
  );
}
