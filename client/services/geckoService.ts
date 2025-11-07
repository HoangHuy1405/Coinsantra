import { Coin } from "@/entities/Coin"

const baseUrl = 'https://api.coingecko.com/api/v3'

export const fetchCoinData = async (coinIds: string[]): Promise<Coin[]> => {
    try {
        if (!coinIds.length) {
            throw new Error("coinIds array cannot be empty")
        }

        const idsParam = coinIds.join(',')
        const apiKey = process.env.GECKO_API_KEY

        // Tạo URL query
        const url = `${baseUrl}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&sparkline=false&x_cg_demo_api_key=${apiKey}`

        const res = await fetch(url, {
            headers: { Accept: "application/json" },
            next: { revalidate: 60 * 60 }, // Tái validate sau mỗi 1 giờ
        })

        if (!res.ok) {
            throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()

        const coins: Coin[] = data.map((coin: any) => ({
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            image: coin.image,
            price: coin.current_price,
            changePercent: coin.price_change_percentage_24h,
            marketCap: coin.market_cap,
            volume24h: coin.total_volume,
            lastUpdated: coin.last_updated,
        }))

        return coins
    } catch (err) {
        console.error("Error fetching coin data:", err)
        return []
    }
}
