"use client"

import useTradingViewWidget from "@/hooks/trading-view/useTradingViewWidget";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { memo, useEffect, useMemo } from "react";
import { fa } from "zod/v4/locales";

interface TradingViewWidgetProps {
    src: string;
    config: Record<string, unknown>;
    height?: number;
    className?: string;
}

const TradingViewWidget = ({ src, config, height = 600, className }: TradingViewWidgetProps) => {
    const { resolvedTheme } = useTheme();
    const isAutoSize = config.autoSize === true;

    const widgetConfig = useMemo(() => {
        console.log(resolvedTheme)
        return {
            ...config,
            colorTheme: resolvedTheme
        }
    }, [resolvedTheme, config]);

    const containerRef = useTradingViewWidget(src, widgetConfig, height);


    return (
        <div
            className={cn("w-full overflow-hidden", isAutoSize ? "h-full" : "", className)}
            style={{ height: isAutoSize ? "100%" : height }}
        >
            <div
                className={cn('tradingview-widget-container', isAutoSize ? "h-full" : "")}
                ref={containerRef}
                style={{ height: "100%", width: "100%" }}
            >
                <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }} />
            </div>
        </div>
    )
}

export default memo(TradingViewWidget)