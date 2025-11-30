export default function MetricBox({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  const color = positive
    ? "text-[var(--chart-3)]"
    : value.includes("-")
      ? "text-[var(--destructive)]"
      : "";

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <p className="text-muted-foreground text-xs flex items-center gap-2">
        {label}
      </p>
      <p className={`mt-2 text-lg font-medium ${color}`}>{value}</p>
    </div>
  );
}
