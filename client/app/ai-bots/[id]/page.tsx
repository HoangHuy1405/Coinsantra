// app/ai-bots/[id]/page.tsx
import { notFound } from "next/navigation";
import { botDatabase } from "@/entities/mockAiBots";
import BotDetailsContent from "./_components/BotDetailsContent";
// import BotDetailsView from "./BotDetailsView";

interface Props {
  params: { id: string };
}

export default function BotDetailsPage({ params }: Props) {
  const botId = params.id;
  const bot = botDatabase.find((b) => b.id === botId);

  if (!bot) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 w-full">
      <BotDetailsContent bot={bot} />
    </div>
  );
}
