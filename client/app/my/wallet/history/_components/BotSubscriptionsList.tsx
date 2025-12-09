import { Badge } from "@/app/ui/shadcn/badge";
import { Card } from "@/app/ui/shadcn/card";
import { Bot, Circle } from "lucide-react";
import type { BotSubscription } from "@/services/interfaces/botSubInterfaces";

interface BotSubscriptionsListProps {
  subscriptions: BotSubscription[];
  selectedSubscription: string;
  onSelectSubscription: (id: string) => void;
}

export function BotSubscriptionsList({
  subscriptions,
  selectedSubscription,
  onSelectSubscription,
}: BotSubscriptionsListProps) {
  return (
    <Card className="shadow-sm">
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Active Subscriptions</h3>
        <div className="space-y-3">
          {subscriptions.map((sub) => {
            const isSelected = selectedSubscription === sub.subscriptionId;
            return (
              <button
                key={sub.subscriptionId}
                onClick={() => onSelectSubscription(sub.subscriptionId)}
                className={`w-full rounded-xl border-2 p-4 text-left
                transition-all hover:shadow-md ${
                  isSelected
                    ? "border-primary bg-accent shadow-sm"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center
                        rounded-full bg-primary/10"
                    >
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          isSelected ? "text-primary" : ""
                        }`}
                      >
                        {sub.botName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sub.tradingPair}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      sub.active
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    <Circle
                      className={`mr-1 h-2 w-2 ${
                        sub.active ? "fill-primary" : "fill-muted-foreground"
                      }`}
                    />
                    {sub.active ? "Running" : "Stopped"}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">PnL</span>
                  <span
                    className={`font-mono font-semibold ${
                      sub.pnl >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {sub.pnl >= 0 ? "+" : ""}${sub.pnl.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Equity</span>
                  <span className="font-mono text-sm">
                    ${sub.totalEquity.toFixed(2)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
