"use client"

import TradingViewWidget from "@/app/ui/widgets/TradingViewWidget";

interface SymbolDetailWidgetProps {
    symbol: string,
    className?: string,
}

export default function SymbolDetailWidget({ symbol, className }: SymbolDetailWidgetProps) {
    const config = {
        symbol: symbol.toUpperCase(),
        isTransparent: "true",
        locale: "en",
        width: "100%",
    };
    return (
        <TradingViewWidget
            src={"https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"}
            config={config}
            className={className}
            height={170}

        />
    )
}
