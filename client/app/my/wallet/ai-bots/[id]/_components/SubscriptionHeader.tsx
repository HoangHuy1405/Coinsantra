"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/ui/shadcn/button";
import { Card } from "@/app/ui/shadcn/card";
import { Badge } from "@/app/ui/shadcn/badge";
import { Label } from "@/app/ui/shadcn/label";
import { Switch } from "@/app/ui/shadcn/switch";
import { COIN_LOGOS } from "@/services/constants/coinConstant";
import Image from "next/image";

interface SubscriptionHeaderProps {
  coin: string;
  botName: string;
  tradingPair: string;
  isActive: boolean;
  onToggleStatus: (enabled: boolean) => void;
}

export default function SubscriptionHeader({
  coin,
  botName,
  tradingPair,
  isActive,
  onToggleStatus,
}: SubscriptionHeaderProps) {
  const logoUrl = COIN_LOGOS[coin];

  return (
    <Card>
      <div
        className="flex flex-col gap-4 p-6 md:flex-row md:items-center
          md:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={coin}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center
                  rounded-full bg-primary/10 border border-primary/20"
              >
                <span className="text-primary font-bold">{coin}</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold leading-none mb-1">
                {botName}
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {tradingPair}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {coin}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-4 border-t pt-4 md:border-t-0
            md:pt-0"
        >
          <div className="flex flex-col items-end">
            <Label
              htmlFor="bot-status"
              className="text-sm text-muted-foreground mb-1"
            >
              Bot Status
            </Label>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  isActive ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                {isActive ? "Active" : "Paused"}
              </span>
              <Switch
                id="bot-status"
                checked={isActive}
                onCheckedChange={onToggleStatus}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
