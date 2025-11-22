'use server';
import { Crypto } from "@/entities/Crypto";
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

export { fetchJSON };

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

function mapCoin(c: any): Crypto {
    return {
        id: c.id,
        symbol: (c.symbol || "").toUpperCase(),
        name: c.name || c.id,
        image: c.image || c.large || c.thumb || "",
        market_cap_rank: c.market_cap_rank ?? null,
        isInWatchlist: false,
    };
}

export const searchCoins = cache(async (query?: string): Promise<Crypto[]> => {
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
