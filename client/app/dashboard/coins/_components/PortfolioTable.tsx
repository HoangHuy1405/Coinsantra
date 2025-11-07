import { DataTable } from '@/app/ui/my_components/data-table/data-table'
import React from 'react'
import { portfolioColumns } from './PortfolioColumn'
import { mockPortfolio } from '@/entities/Coin'

export default function PortfolioTable() {
    return (
        <DataTable columns={portfolioColumns} data={mockPortfolio} />
    )
}
