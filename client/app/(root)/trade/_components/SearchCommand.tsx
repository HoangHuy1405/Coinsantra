"use client";

import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Command, Search } from "lucide-react";
import { searchCoins } from "@/lib/actions/gecko.actions";
import { Crypto } from "@/entities/Crypto";
import { useRouter } from "next/navigation";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/app/ui/shadcn/command";

interface SearchCommandProps {
    initial: Crypto[];
}

export default function SearchCommand({ initial }: SearchCommandProps) {
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [cryptos, setCryptos] = useState<Crypto[]>(initial);
    const [shortcut, setShortcut] = useState("Ctrl + K");

    const isSearchMode = !!searchTerm.trim();
    const displayList = isSearchMode ? cryptos : initial.slice(0, 10);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    useEffect(() => {
        const isMac =
            typeof window !== "undefined" &&
            window.navigator.platform.toUpperCase().includes("MAC");

        setShortcut(isMac ? "⌘ + K" : "Ctrl + K");
    }, []);

    const handleSearch = useDebouncedCallback(async (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) {
            setCryptos(initial);
            return;
        }

        setLoading(true);
        try {
            const results = await searchCoins(trimmed);

            setCryptos(results);
        } catch {
            setCryptos([]);
        } finally {
            setLoading(false);
        }
    }, 500);

    const handleSelectCrypto = (coin: Crypto) => {
        router.push(`/trade/${coin.symbol.toUpperCase()}`);
        setOpen(false);
        setSearchTerm("");
        setCryptos(initial);
    };

    return (
        <div>
            {/* SEARCH BUTTON */}
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 bg-muted hover:bg-muted/70 transition w-[260px]"
            >
                <Search className="w-4 h-4 opacity-70" />
                <span className="text-sm">Search crypto...</span>
                <kbd className="ml-auto text-xs text-muted-foreground px-1.5 py-0.5 bg-gray-200 rounded">
                    {shortcut}
                </kbd>
            </button>

            {/* COMMAND DIALOG */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                {/* INPUT */}
                <CommandInput
                    placeholder="Search cryptos ..."
                    value={searchTerm}
                    onValueChange={(v) => {
                        setSearchTerm(v);
                        handleSearch(v);
                    }}
                />

                {/* LIST */}
                <CommandList >
                    {!loading && (
                        <CommandEmpty>No results found.</CommandEmpty>
                    )}
                    <CommandGroup heading="Cryptocurrencies">

                        {/* Loading state */}
                        {loading && (
                            <div className="p-3 text-sm text-muted-foreground">
                                Searching...
                            </div>
                        )}

                        {!loading &&
                            displayList.map((coin) => (
                                <CommandItem
                                    key={coin.id}
                                    value={coin.name}
                                    onSelect={() => handleSelectCrypto(coin)}
                                    className="flex items-center gap-3 cursor-pointer"
                                >
                                    <img
                                        src={coin.image}
                                        className="w-6 h-6 rounded-full"
                                        alt={coin.name}
                                    />

                                    <div className="flex flex-col">
                                        <span>{coin.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {coin.symbol.toUpperCase()}
                                        </span>
                                    </div>

                                    {coin.market_cap_rank && (
                                        <span className="text-xs ml-auto text-muted-foreground">
                                            #{coin.market_cap_rank}
                                        </span>
                                    )}
                                </CommandItem>
                            ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </div>
    );
}
