import { searchCoins } from "@/lib/actions/gecko.actions";
import { redirect } from "next/navigation";

export default async function TradeIndexPage() {
    const coins = await searchCoins();
    const first = coins[0]?.symbol?.toUpperCase() ?? "BTC";

    redirect(`/trade/${first}`);
}