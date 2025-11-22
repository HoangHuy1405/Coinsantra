"use client";

import React from "react";
import TradingViewWidget from "../../widgets/TradingViewWidget";

export default function MarketOverview({ className }: { className?: string }) {
  const config = {
    dateRange: "12M",
    locale: "en",
    largeChartUrl: "",
    showFloatingTooltip: true,
    plotLineColorGrowing: "rgba(41, 98, 255, 1)",
    plotLineColorFalling: "rgba(41, 98, 255, 1)",
    gridLineColor: "rgba(240, 243, 250, 0)",
    scaleFontColor: "#DBDBDB",
    belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
    belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
    belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
    belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
    symbolActiveColor: "rgba(41, 98, 255, 0.12)",
    tabs: [
      {
        title: "Indices",
        symbols: [
          { s: "FOREXCOM:SPXUSD", d: "S&P 500 Index" },
          { s: "FOREXCOM:NSXUSD", d: "US 100 Cash CFD" },
          { s: "FOREXCOM:DJI", d: "Dow Jones Industrial Average Index" },
          { s: "INDEX:NKY", d: "Japan 225" },
          { s: "INDEX:DEU40", d: "DAX Index" },
          { s: "FOREXCOM:UKXGBP", d: "FTSE 100 Index" },
        ],
      },
      {
        title: "Futures",
        symbols: [
          { s: "BMFBOVESPA:ISP1!", d: "S&P 500" },
          { s: "BMFBOVESPA:EUR1!", d: "Euro" },
          { s: "CMCMARKETS:GOLD", d: "Gold" },
          { s: "PYTH:WTI3!", d: "WTI Crude Oil" },
          { s: "BMFBOVESPA:CCM1!", d: "Corn" },
        ],
      },
      {
        title: "Bonds",
        symbols: [
          { s: "EUREX:FGBL1!", d: "Euro Bund" },
          { s: "EUREX:FBTP1!", d: "Euro BTP" },
          { s: "EUREX:FGBM1!", d: "Euro BOBL" },
        ],
      },
      {
        title: "Forex",
        symbols: [
          { s: "FX:EURUSD", d: "EUR to USD" },
          { s: "FX:GBPUSD", d: "GBP to USD" },
          { s: "FX:USDJPY", d: "USD to JPY" },
          { s: "FX:USDCHF", d: "USD to CHF" },
          { s: "FX:AUDUSD", d: "AUD to USD" },
          { s: "FX:USDCAD", d: "USD to CAD" },
        ],
      },
    ],
    support_host: "https://www.tradingview.com",
    showSymbolLogo: true,
    showChart: true,
  };

  return (
    <TradingViewWidget
      src="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
      config={config}
      className={className}
    />
  );
}
