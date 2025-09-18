'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

type Props = {
    /** URL script của widget TradingView */
    src: string;
    /** JSON config đúng schema của widget */
    config: Record<string, any>;
    /** Chiều cao/chiều rộng nên do cha quản lý (className, style) */
    className?: string;
};

export default function TradingViewWidget({ src, config, className }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!containerRef.current) return;

        // Xóa widget cũ (nếu có) trước khi mount lại
        containerRef.current.innerHTML = '';

        // Tạo khối container theo yêu cầu của TradingView
        const widgetHolder = document.createElement('div');
        widgetHolder.className = 'tradingview-widget-container';

        const widget = document.createElement('div');
        widget.className = 'tradingview-widget-container__widget';

        const copyright = document.createElement('div');
        copyright.className = 'tradingview-widget-copyright';

        // Script TradingView + JSON config ở trong innerHTML của tag <script>
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        script.async = true;

        // Áp dụng theme (light/dark) theo next-themes nếu widget có hỗ trợ
        const colorTheme = theme === 'dark' ? 'dark' : 'light';
        const scaleFontColor = theme === 'dark' ? '#DBDBDB' : '#0F0F0F';
        const finalConfig = { ...config, colorTheme, scaleFontColor, autosize: true };

        script.innerHTML = JSON.stringify(finalConfig);

        widgetHolder.appendChild(widget);
        widgetHolder.appendChild(copyright);
        widgetHolder.appendChild(script);

        containerRef.current.appendChild(widgetHolder);

        // Cleanup khi unmount
        return () => {
            containerRef.current && (containerRef.current.innerHTML = '');
        };
        // Re-init khi theme hoặc config thay đổi
    }, [src, theme, JSON.stringify(config)]);

    return <div ref={containerRef} className={className} />;
}
