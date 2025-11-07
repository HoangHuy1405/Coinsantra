import React from 'react'
import AssetsCard from './_components/AssetsCard'
import { mockCoins } from '@/entities/Coin'
import PortfolioPerformanceChart from './_components/PortfolioPerformanceChart'
import { mockPortfolioPerformance } from '@/entities/mockPortfolioPerformance'
import PortfolioTable from './_components/PortfolioTable'


// export const getServerSideProps = async () => {

// }

export default function page() {
    return (
        <div className="flex flex-col gap-6">

            {/* Assets Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <AssetsCard {...mockCoins[0]} />
                <AssetsCard {...mockCoins[1]} />
                <AssetsCard {...mockCoins[2]} />
                <AssetsCard {...mockCoins[3]} />
            </div>

            {/* Chart */}
            <PortfolioPerformanceChart data={mockPortfolioPerformance} />

            {/* Table */}
            <div>
                <PortfolioTable />
            </div>
        </div>
    )
}
