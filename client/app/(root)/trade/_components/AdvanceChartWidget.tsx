import TradingViewWidget from "@/app/ui/widgets/TradingViewWidget"


interface AdvanceChartWidgetProps {
    symbol: string,
    className?: string
    height?: number
}

export default function AdvanceChartWidget({ symbol, height, className }: AdvanceChartWidgetProps) {
    return (
        <TradingViewWidget
            src={"https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"}
            config={{
                allow_symbol_change: false,
                calendar: true,
                details: true,
                hide_side_toolbar: true,
                hide_top_toolbar: false,
                hide_legend: false,
                hide_volume: false,
                hotlist: false,
                interval: "D",
                locale: "en",
                save_image: true,
                style: "1",
                symbol: symbol,
                timezone: "Etc/UTC",
                watchlist: [],
                withdateranges: false,
                compareSymbols: [],
                studies: [],
                autoSize: true,
            }}
            height={height}
            className={className}
        />
    )
}
