"use client";

import React, { useState } from "react";
import { BotCard, timeSlot } from "./_components/BotCard";
import { botDatabase } from "@/entities/mockAiBots";
import AiBotIntro from "./_components/AiBotIntro";
import { FilterSortBar } from "./_components/FilterSortBar";
import { PaginationBar } from "../ui/my_components/PaginationBar";
import { useRouter } from "next/navigation";

export default function AiBotPage() {
  const router = useRouter();
  const [timeWindow, setTimeWindow] = useState<timeSlot>("7d");
  const [sort, setSort] = useState<"pnl" | "roi" | "copied">("pnl");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const bots = botDatabase;

  const handleCopy = (id: string) => {};
  const onNavigateToBotDetail = (id: string) => {
    router.push(`/ai-bots/${id}`);
  };

  return (
    <main
      className="flex flex-col w-full max-w-6xl mx-auto px-4 py-8 bg-background"
    >
      {/* Intro section */}
      <AiBotIntro
        totalBots={botDatabase.length}
        activeTraders={53244}
        totalValue={351000}
      />

      {/* Sort / Filter Bar */}
      <section className="mb-6 w-full flex flex-col justify-between">
        <h1 className="text-2xl font-semibold mb-6">Marketplace</h1>
        <FilterSortBar
          enableSearch={true}
          searchValue={search}
          onSearchChange={setSearch}
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
            key={bot.id}
            id={bot.id}
            name={bot.name}
            roi1d={bot.roi1d}
            roi7d={bot.roi7d}
            roi30d={bot.roi30d}
            roiAllTime={bot.roiAllTime}
            pnl1d={bot.pnl1d}
            pnl7d={bot.pnl7d}
            pnl30d={bot.pnl30d}
            maxDrawdown={bot.maxDrawdown}
            assets={bot.assets}
            activeUsers={bot.activeUsers}
            onCopy={handleCopy}
            onClick={onNavigateToBotDetail}
            timeWindow={timeWindow}
            priority="pnl"
          />
        ))}
      </section>
      {/* Pagination */}
      <PaginationBar
        totalItems={bots.length}
        itemsPerPage={9}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* how to section */}
      <section id="how-to">
        <h2>How To Use</h2>
        <p>Here is the tutorial...</p>
      </section>
    </main>
  );
}
