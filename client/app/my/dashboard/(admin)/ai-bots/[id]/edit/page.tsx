import AdminBotEdit from "./_components/AdminBotEdit";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 3. You must 'await' the params before using them
  const resolvedParams = await params;
  const botId = resolvedParams.id;

  return <AdminBotEdit botId={botId} />;
}
