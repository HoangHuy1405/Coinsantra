import { searchCoins } from "@/lib/actions/gecko.actions";

import Link from "next/link";
import { Button } from "@/app/ui/shadcn/button";
import { Lock } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-option";
import AdvanceChartWidget from "@/app/(root)/trade/_components/AdvanceChartWidget";
import RecentTradesWidget from "@/app/(root)/trade/_components/RecentTradesWidget";
import SearchCommand from "@/app/(root)/trade/_components/SearchCommand";
import SpotOrderForm from "@/app/(root)/trade/_components/SpotOrderForm";
import SymbolDetailWidget from "@/app/(root)/trade/_components/SymbolDetailWidget";
import UserHistoryWidget from "@/app/(root)/trade/_components/UserHistoryWidget";

interface TradePageProps {
    params: Promise<{ symbol: string }>
}

export default async function TradePage({ params }: TradePageProps) {
    const { symbol } = await params;
    const initialCoins = await searchCoins();

    const session = await getServerSession(authOptions);
    const isLoggedIn = !!session?.user;

    return (
        <div className="flex flex-col bg-background text-foreground gap-2">

            {/* TITLE */}
            <div className="flex justify-between relative">
                <SymbolDetailWidget
                    symbol={symbol}
                    className="border-2 rounded-sm"
                />
                <div className="hidden md:block absolute right-3 top-27">
                    <SearchCommand initial={initialCoins} />
                </div>
            </div>


            {/*  MAIN LAYOUT */}
            <div className="flex flex-col lg:grid lg:grid-cols-13 lg:grid-rows-1 xl:flex xl:flex-col gap-2">

                {/* CHART SECTION */}
                <section className="lg:col-span-9 border rounded-sm flex flex-col overflow-hidden h-auto xl:h-[500px]">

                    {/* CHART WRAPPER */}
                    <div className="w-full h-[400px] xl:h-full">
                        <AdvanceChartWidget symbol={symbol} />
                    </div>

                    {/* HISTORY (LG only) */}
                    <div className="hidden lg:block xl:hidden h-[250px] p-4 border-t bg-background">
                        <RecentTradesWidget />
                    </div>

                </section>

                {/* TRADING TOOLS SECTION */}
                <section className="flex-1 lg:col-span-4 lg:flex lg:flex-col xl:flex-row">

                    <div className="flex flex-col w-full h-full xl:flex-row border-2 rounded-sm p-2 gap-2">
                        {/* Order Form */}
                        <div className="shrink-0 lg:flex-none xl:w-[700px] xl:h-full">
                            <SpotOrderForm symbol={symbol} currency={"USD"} price={0} isLoggedIn={isLoggedIn} />
                        </div>

                        {/* History (xl only) */}
                        <div className="hidden xl:block flex-1 p-4 border-l-2 ">
                            <div className="font-bold text-muted-foreground mb-2 px-2 text-xs">My Trades</div>
                            {isLoggedIn ? (
                                <UserHistoryWidget symbol={symbol} />

                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground bg-secondary/5 rounded-lg border border-dashed border-secondary/30 m-1">
                                    <div className="p-3 bg-secondary/20 rounded-full">
                                        <Lock className="w-5 h-5 opacity-50" />
                                    </div>

                                    <div className="text-center space-y-1">
                                        <p className="text-sm font-medium text-foreground">Login Required</p>
                                        <p className="text-xs opacity-70">Please log in to view your trade history</p>
                                    </div>

                                    <Link href="/login">
                                        <Button variant="default" size="sm" className="px-6">
                                            Log In
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div >
        </div >
    );
}