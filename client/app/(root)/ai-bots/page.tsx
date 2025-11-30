"use client";

import React, { useState } from "react";
import { BotCard } from "./_components/BotCard";
import AiBotIntro from "./_components/AiBotIntro";
import { FilterSortBar } from "./_components/FilterSortBar";
import { PaginationBar } from "../../ui/my_components/PaginationBar";
import { useRouter } from "next/navigation";
import {
  BotMetricsDTO,
  SortOption,
  TimeWindow,
} from "@/services/interfaces/botInterfaces";
import { usePublicBots } from "@/hooks/bot/usePublicBots";
import { BotConfigDialog } from "./_components/BotConfigDialog";
import { signIn, useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AiBotPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [timeWindow, setTimeWindow] = useState<TimeWindow>("7d");
  const [sort, setSort] = useState<SortOption>("pnl");
  const [search, setSearch] = useState("");
  const [currentPage, setPage] = useState(1);
  const pageSize = 9;

  const [copyingBotId, setCopyingBotId] = useState<string | null>(null);
  const handleCopy = (id: string) => {
    // 3. Check authentication status
    if (status === "unauthenticated") {
      toast.error("Please log in to copy this strategy");

      // 4. Redirect to login, and return here after success
      router.push("/login");
      return;
    }
    // Optional: Prevent action if session is still loading
    if (status === "loading") {
      return;
    }
    setCopyingBotId(id);
  };

  // const bots = botDatabase;
  const { data, isLoading, isError } = usePublicBots({
    page: currentPage,
    size: pageSize,
    search,
    sort,
    timeWindow,
  });
  const bots = data?.data?.result || [];
  const meta = data?.data?.meta;
  const totalPages = meta?.pages || 1;
  const totalItems = meta?.total || 0;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };
  const handleSortChange = (val: any) => {
    setSort(val);
    setPage(1);
  };
  const onNavigateToBotDetail = (id: string) => {
    router.push(`/ai-bots/${id}`);
  };

  return (
    <main
      className="flex flex-col w-full max-w-6xl mx-auto px-4 py-8 bg-background"
    >
      {/* Intro section */}
      <AiBotIntro
        totalBots={totalItems}
        activeTraders={53244}
        totalValue={351000}
      />

      {/* Sort / Filter Bar */}
      <section className="mb-6 w-full flex flex-col justify-between">
        <h1 className="text-2xl font-semibold mb-6">Marketplace</h1>
        <FilterSortBar
          enableSearch={true}
          searchValue={search}
          onSearchChange={handleSearchChange}
          sortValue={sort}
          onSortChange={setSort}
          timeWindow={timeWindow}
          onTimeWindowChange={setTimeWindow}
          pageNumber={currentPage}
        />
      </section>

      {/* Bot Grid */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full"
      >
        {bots.map((bot) => (
          <BotCard
            key={bot.botId}
            id={bot.botId}
            name={bot.name}
            roi={bot.averageRoi || 0}
            pnl={bot.totalPnl || 0}
            maxDrawdown={bot.maxDrawdown || 0}
            coin={bot.coinSymbol || ""}
            activeUsers={bot.activeSubscribers || 0}
            onCopy={handleCopy}
            onClick={onNavigateToBotDetail}
            timeWindow={timeWindow}
            priority={sort}
          />
        ))}
      </section>
      {/* Pagination */}
      <div className="mt-8">
        <PaginationBar
          totalItems={totalItems}
          itemsPerPage={pageSize}
          currentPage={currentPage}
          onPageChange={setPage}
        />
      </div>

      {/* how to section */}
      <section id="how-to">
        <h2>How To Use</h2>
        <p>Here is the tutorial...</p>
      </section>

      <BotConfigDialog
        isOpen={!!copyingBotId} // Open if we have an ID
        botId={copyingBotId || ""} // Pass the ID to the form
        onClose={() => setCopyingBotId(null)} // Clear ID to close
      />
    </main>
  );
}
