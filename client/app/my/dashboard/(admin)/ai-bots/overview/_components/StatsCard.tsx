import { Card } from "@/app/ui/shadcn/card";

export function StatsCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Card className="border border-border bg-card overflow-hidden">
      <div className="flex">
        <div className={`w-1 self-stretch ${accent}`} />
        <div className="flex items-center gap-4 p-6 flex-1">
          <div className={`${accent}/10 rounded-lg p-3`}>{icon}</div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-3xl font-semibold">{value}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
