import { FAQItem } from "@/app/types/FAQItem";

export const faqItems: FAQItem[] = [
    {
        id: 'item-1',
        icon: 'clock',
        question: 'What are the trading hours?',
        answer:
            'Our platform operates 24/7, allowing you to trade cryptocurrencies and digital assets anytime. However, scheduled maintenance or network upgrades may cause temporary downtime, which will be announced in advance.',
    },
    {
        id: 'item-2',
        icon: 'credit-card',
        question: 'How do deposits and withdrawals work?',
        answer:
            'You can fund your account via supported cryptocurrencies or fiat gateways. Withdrawals are processed automatically on-chain, with network fees depending on the asset. Processing time varies by blockchain congestion.',
    },
    {
        id: 'item-3',
        icon: 'shield',
        question: 'Is my account secure?',
        answer:
            'We use industry-standard security practices including two-factor authentication (2FA), cold wallet storage, withdrawal whitelists, and real-time monitoring. You can further secure your account by enabling biometric login or hardware key authentication.',
    },
    {
        id: 'item-4',
        icon: 'bar-chart-3',
        question: 'What types of trading are available?',
        answer:
            'We support Spot trading, Margin trading with leverage up to 10x, and Perpetual Futures contracts with leverage up to 100x. Advanced order types such as Limit, Market, Stop-Limit, and OCO are also available.',
    },
    {
        id: 'item-5',
        icon: 'globe',
        question: 'Do you offer global support?',
        answer:
            'Yes, our platform is available worldwide and supports multiple languages including English, Spanish, Vietnamese, and Chinese. Fiat on-ramp options may vary depending on your region due to regulatory restrictions.',
    },
    {
        id: 'item-6',
        icon: 'help-circle',
        question: 'How do I contact support?',
        answer:
            'You can reach our support team via live chat, email, or by submitting a ticket in your account dashboard. For urgent trading-related issues, our 24/7 live chat is the fastest way to get assistance.',
    },
]
