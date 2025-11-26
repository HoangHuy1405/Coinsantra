"use client";

import React from "react";
import TradingViewWidget from "./TradingViewWidget";

export default function TickerTape({ className }: { className?: string }) {
  const config = {
    symbols: [
      { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
      { proName: "FOREXCOM:NSXUSD", title: "US 100" },
      { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
      { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
      { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
    ],
    showSymbolLogo: true,
    displayMode: "adaptive",
    locale: "en",
    largeChartUrl: "",
    isAutoSize: true,
    isTransparent: false,
  };

  return (
    <TradingViewWidget
      src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
      config={config}
      className={className}
      height={43}
    />
  );
}
