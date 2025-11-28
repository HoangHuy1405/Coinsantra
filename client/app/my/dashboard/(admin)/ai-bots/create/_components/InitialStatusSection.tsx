// "use client";

// import { SectionCard } from "@/app/ui/my_components/Card/SectionCard";
// import { Label } from "@/app/ui/shadcn/label";
// import { Switch } from "@/app/ui/shadcn/switch";

// interface Props {
//   enabled: boolean;
//   setEnabled: (v: boolean) => void;

//   autoError: boolean;
//   setAutoError: (v: boolean) => void;

//   autoUnsupported: boolean;
//   setAutoUnsupported: (v: boolean) => void;
// }

// export function InitialStatusSection({
//   enabled,
//   setEnabled,
//   autoError,
//   setAutoError,
//   autoUnsupported,
//   setAutoUnsupported,
// }: Props) {
//   return (
//     <SectionCard title="Initial Status">
//       <div
//         className="flex items-center justify-between rounded border
//           border-border bg-muted/50 p-4"
//       >
//         <div>
//           <Label>Enable Bot After Creation</Label>
//           <p className="text-xs text-muted-foreground">
//             Bot will start trading immediately.
//           </p>
//         </div>
//         <Switch checked={enabled} onCheckedChange={setEnabled} />
//       </div>

//       <div
//         className="flex items-center justify-between rounded border
//           border-border bg-muted/50 p-4"
//       >
//         <div>
//           <Label>Auto-Pause on Errors</Label>
//           <p className="text-xs text-muted-foreground">
//             Pauses bot after repeated failures.
//           </p>
//         </div>
//         <Switch checked={autoError} onCheckedChange={setAutoError} />
//       </div>

//       <div
//         className="flex items-center justify-between rounded border
//           border-border bg-muted/50 p-4"
//       >
//         <div>
//           <Label>Auto-Pause on Unsupported Coins</Label>
//           <p className="text-xs text-muted-foreground">
//             Pauses when bot signals unsupported cryptocurrency.
//           </p>
//         </div>
//         <Switch
//           checked={autoUnsupported}
//           onCheckedChange={setAutoUnsupported}
//         />
//       </div>
//     </SectionCard>
//   );
// }
