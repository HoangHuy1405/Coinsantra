import { Card } from "@/app/ui/shadcn/card";

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border border-border bg-card p-6 space-y-6">
      <h2>{title}</h2>
      {children}
    </Card>
  );
}
