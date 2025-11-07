import { Badge } from '@/app/ui/shadcn/badge'
import { Card, CardContent, CardHeader } from '@/app/ui/shadcn/card'
import React from 'react'

export interface AssetCardProps {
    id: string
    symbol: string
    name: string
    image: string
    price: number
    changePercent: number
}

export default function AssetsCard(props: AssetCardProps) {
    const isUp = props.changePercent >= 0
    return (
        <Card>
            <CardContent className="space-y-3">
                <div className="flex space-x-4">
                    <img src={props.image} alt={props.name} className="w-10 h-10" />
                    <div className="flex flex-col">
                        <h1 className='text-base font-bold uppercase tracking-wide'>{props.symbol}</h1>
                        <span className='text-sm text-muted-foreground'>{props.name}</span>
                    </div>
                </div>
                <div className="flex justify-between items-end">
                    <span className='text-lg font-bold'>${props.price}</span>

                    <Badge variant={isUp ? "positive" : "negative"}>
                        {isUp ? '▲' : '▼'} {Math.abs(props.changePercent)}%
                    </Badge>
                </div>
            </CardContent>
        </Card>
    )
}
