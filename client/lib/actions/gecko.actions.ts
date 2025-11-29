'use server';
import { Coin } from "@/entities/Coin/Coin";
import { MarketCoin } from "@/entities/Coin/MarketCoin";
import { unstable_cache } from "next/cache";
import { cache } from "react";

async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
    const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
        ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
        : { cache: 'no-store' };

    const res = await fetch(url, options);
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Fetch failed ${res.status}: ${text}`);
    }
    return (await res.json()) as T;
}
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export { fetchJSON };

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

function mapCoin(c: any): Coin {
    return {
        id: c.id,
        symbol: (c.symbol || "").toUpperCase(),
        name: c.name || c.id,
        image: c.image || c.large || c.thumb || "",
        market_cap_rank: c.market_cap_rank ?? null,
    };
}

export const searchCoins = cache(async (query?: string): Promise<Coin[]> => {
    try {
        const trimmed = typeof query === "string" ? query.trim().toLowerCase() : "";
        let results: any[] = [];

        // CASE 1: No query → top 10
        if (!trimmed) {
            const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1`;
            const top10 = await fetchJSON<any[]>(url, 3600);
            results = top10 ?? [];
        }

        // CASE 2: Có query → search API
        else {
            const searchUrl = `${COINGECKO_BASE}/search?query=${encodeURIComponent(trimmed)}`;
            const data = await fetchJSON<any>(searchUrl, 1800);
            results = data?.coins ?? [];
        }

        // Map & limit
        return results.slice(0, 15).map(mapCoin);

    } catch (err) {
        console.error("Error in searchCoins:", err);
        return [];
    }
});

async function fetchMarketData(limit: number): Promise<MarketCoin[]> {
    let allCoins: MarketCoin[] = [];
    const perPage = 250;
    const totalPages = Math.ceil(limit / perPage);

    try {
        for (let page = 1; page <= totalPages; page++) {
            const url = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`;

            const res = await fetch(url);

            if (!res.ok) {
                if (res.status === 429) {
                    console.warn(`[Server] Rate limit at page ${page}. Waiting 5s...`);
                    await sleep(5000);
                    page--;
                    continue;
                }
                console.error(`[Server] Error fetching page ${page}: ${res.statusText}`);
                break;
            }

            const rawData = await res.json();

            const formattedBatch: MarketCoin[] = rawData.map((item: any) => ({
                id: item.id,
                symbol: item.symbol.toUpperCase(),
                name: item.name,
                image: item.image,
                market_cap_rank: item.market_cap_rank,
                price: item.current_price || 0,
                changePercent: item.price_change_percentage_24h || 0,
                lastUpdate: Date.now(),
                quoteVolume: item.total_volume || 0,
                history: Array(50).fill(item.current_price || 0),
            }));

            allCoins = [...allCoins, ...formattedBatch];
            if (page < totalPages) await sleep(1000);
        }

        return allCoins.slice(0, limit);

    } catch (error) {
        console.error("[Server] Fetch failed:", error);
        return [];
    }
}

export const getCachedMarketData = unstable_cache(
    async (limit: number) => fetchMarketData(limit),
    ['market-data-coins'],
    {
        revalidate: 300,
        tags: ['coins']
    }
);