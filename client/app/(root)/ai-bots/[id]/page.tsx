// app/ai-bots/[id]/page.tsx
import { notFound } from "next/navigation";
import { botDatabase } from "@/entities/mockAiBots";
import BotDetailsContent from "./_components/BotDetailsContent";

interface Props {
  params: Promise<{ id: string }>;
}

// 2. Make the component async
export default async function BotDetailsPage({ params }: Props) {
  // 3. Await the params before using properties
  const { id } = await params;

  // Now use 'id' normally
  const bot = botDatabase.find((b) => b.id === id);

  if (!bot) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 w-full">
      <BotDetailsContent bot={bot} />
    </div>
  );
}
