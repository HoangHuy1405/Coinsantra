"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/ui/shadcn/tabs"
import { Input } from "@/app/ui/shadcn/input"
import { Button } from "@/app/ui/shadcn/button"
import { Slider } from "@/app/ui/shadcn/slider"
import { Label } from "@/app/ui/shadcn/label"
import { Checkbox } from "@/app/ui/shadcn/checkbox"
import { cn } from "@/lib/utils"

interface OrderInputSectionProps {
    side: "buy" | "sell";
    orderType: "limit" | "market";
    currency: string;
    symbol: string;
    balance: number;
    currentPrice: number;
    disabled?: boolean;
    showTPSL: boolean;
    onToggleTPSL: (checked: boolean) => void;
}

const OrderInputSection = ({
    side,
    orderType,
    currency,
    symbol,
    balance,
    currentPrice,
    disabled,
    showTPSL,
    onToggleTPSL
}: OrderInputSectionProps) => {

    const [priceVal, setPriceVal] = useState<string>(orderType === "limit" ? currentPrice.toString() : "");
    const [amountVal, setAmountVal] = useState<string>("");
    const [percentage, setPercentage] = useState([0]);

    const [tpVal, setTpVal] = useState("");
    const [slVal, setSlVal] = useState("");

    const isBuy = side === "buy";
    const btnColor = isBuy ? "bg-[#0ecb81] hover:bg-[#0ecb81]/90" : "bg-[#f6465d] hover:bg-[#f6465d]/90";
    const isMarket = orderType === "market";

    return (
        <div className="flex flex-col gap-4 py-2">
            {/* PRICE INPUT */}
            <div className="flex gap-2 items-center">
                <div className="relative w-full group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground group-focus-within:text-foreground transition-colors z-10">
                        Price
                    </div>
                    <Input
                        className={cn(
                            "h-10 pl-12 text-right font-mono text-sm",
                            isMarket && "opacity-50 bg-secondary/20 cursor-not-allowed",
                            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        )}
                        placeholder={isMarket ? "Market Price" : currentPrice.toString()}
                        value={isMarket ? "" : priceVal}
                        onChange={(e) => setPriceVal(e.target.value)}
                        disabled={disabled || isMarket}
                        type="number"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                        {currency}
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="h-10 px-3 text-xs font-semibold text-muted-foreground shrink-0"
                    disabled={disabled || isMarket}
                    onClick={() => setPriceVal(currentPrice.toString())}
                >
                    BBO
                </Button>
            </div>

            {/* AMOUNT INPUT */}
            <div className="relative w-full group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground group-focus-within:text-foreground transition-colors z-10">
                    Amount
                </div>
                <Input
                    className="h-10 pr-15 text-right font-mono text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="Amount"
                    value={amountVal}
                    disabled={disabled}
                    onChange={(e) => setAmountVal(e.target.value)}
                    type="number"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                    {symbol}
                </div>
            </div>

            {/* SLIDER */}
            <div className="px-1 py-4 relative group">
                <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between px-0 pointer-events-none z-0">
                    {[0, 25, 50, 75, 100].map((val) => {
                        const isActive = percentage[0] >= val;
                        return (
                            <div
                                key={val}
                                className={cn(
                                    "w-2.5 h-2.5 rotate-45 border-2 transition-all duration-300",
                                    "bg-background",
                                    isActive
                                        ? (side === "buy" ? "border-[#0ecb81] bg-[#0ecb81]" : "border-[#f6465d] bg-[#f6465d]")
                                        : "border-muted-foreground/30"
                                )}
                            />
                        );
                    })}
                </div>

                <Slider
                    defaultValue={[0]}
                    max={100}
                    step={25}
                    value={percentage}
                    onValueChange={setPercentage}
                    className={cn(
                        "relative z-10 cursor-pointer py-1.5",
                        side === "buy"
                            ? "[&_span[data-slot=slider-range]]:bg-[#0ecb81] [&_span[data-slot=slider-thumb]]:border-[#0ecb81] [&_span[data-slot=slider-thumb]]:ring-[#0ecb81]/30"
                            : "[&_span[data-slot=slider-range]]:bg-[#f6465d] [&_span[data-slot=slider-thumb]]:border-[#f6465d] [&_span[data-slot=slider-thumb]]:ring-[#f6465d]/30"
                    )}
                />
            </div>

            {/* TP/SL TRIGGER CHECKBOX */}
            <div className="flex items-center space-x-2 mt-1">
                <Checkbox
                    id={`tpsl-${side}`}
                    checked={showTPSL}
                    onCheckedChange={(checked) => onToggleTPSL(!!checked)}
                />
                <Label htmlFor={`tpsl-${side}`} className="text-xs font-medium text-muted-foreground cursor-pointer">TP/SL</Label>
            </div>

            {/* TP/SL INPUT FIELDS */}
            {showTPSL && (
                <div className="space-y-3 mt-2 animate-in slide-in-from-top-2 duration-200">
                    {/* TAKE PROFIT */}
                    <div className="relative w-full group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground group-focus-within:text-foreground transition-colors z-10 whitespace-nowrap">
                            Take Profit
                        </div>
                        <Input
                            className="h-10 pr-15 text-right font-mono text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="TP Limit"
                            value={tpVal}
                            onChange={(e) => setTpVal(e.target.value)}
                            type="number"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                            {currency}
                        </div>
                    </div>

                    {/* STOP LOSS */}
                    <div className="relative w-full group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground group-focus-within:text-foreground transition-colors z-10 whitespace-nowrap">
                            Stop Loss
                        </div>
                        <Input
                            className="h-10 pr-15 text-right font-mono text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="SL Limit"
                            value={slVal}
                            onChange={(e) => setSlVal(e.target.value)}
                            type="number"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                            {currency}
                        </div>
                    </div>
                </div>
            )}

            {/* INFO ROW */}
            <div className="flex flex-col gap-1 text-xs text-muted-foreground px-3">
                <div className="flex justify-between">
                    <span>Avbl</span>
                    <span className="font-mono text-foreground">{balance.toLocaleString()} {isBuy ? currency : symbol}</span>
                </div>
                <div className="flex justify-between">
                    <span className="underline decoration-dotted decoration-muted-foreground/50">Max {isBuy ? 'Buy' : 'Sell'}</span>
                    <span className="font-mono text-foreground">-- {isBuy ? symbol : currency}</span>
                </div>
            </div>

            {/* ACTION BUTTON */}
            {!disabled ? (
                <Button className={cn("w-full font-bold text-base h-10 mt-2 text-white transition-all hover:brightness-110", btnColor)}>
                    {isBuy ? "Buy" : "Sell"} {symbol}
                </Button>
            ) : (
                <Button className={cn("w-full font-bold text-base h-10 mt-2 text-white transition-all hover:brightness-110", btnColor)}>
                    Log In
                </Button>
            )}
        </div>
    );
};

interface SpotOrderFormProps {
    symbol: string;
    currency: string;
    price: number;
    isLoggedIn: boolean;
}

export default function SpotOrderForm({ symbol = "ZEC", currency = "USDT", price = 601.86, isLoggedIn }: SpotOrderFormProps) {
    const [activeTab, setActiveTab] = useState<string>("buy");
    const [orderType, setOrderType] = useState<"limit" | "market">("limit");

    const [showTPSL, setShowTPSL] = useState(false);

    return (
        <div className="flex flex-col h-full w-full bg-background text-foreground px-4">

            <Tabs
                value={orderType}
                onValueChange={(val) => setOrderType(val as "limit" | "market")}
                className="w-full mb-4"
                variant="underline"
            >
                <TabsList className=" border-b-0 gap-6">
                    <TabsTrigger value="limit" className="px-0 py-2 font-bold text-muted-foreground">Limit</TabsTrigger>
                    <TabsTrigger value="market" className="px-0 py-2 font-bold text-muted-foreground">Market</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* SMALL SCREEN */}
            <div className="xl:hidden flex-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
                    <TabsList className="w-full grid grid-cols-2 h-10 mb-4 bg-transparent p-0 gap-1">
                        <TabsTrigger value="buy" className="data-[state=active]:bg-[#0ecb81] data-[state=active]:text-white bg-secondary/30 h-full rounded-sm -skew-x-12"><span className="skew-x-12 font-bold text-xs uppercase">Buy</span></TabsTrigger>
                        <TabsTrigger value="sell" className="data-[state=active]:bg-[#f6465d] data-[state=active]:text-white bg-secondary/30 h-full rounded-sm -skew-x-12"><span className="skew-x-12 font-bold text-xs uppercase">Sell</span></TabsTrigger>
                    </TabsList>

                    <TabsContent value="buy" className="mt-0 h-full">
                        <OrderInputSection
                            side="buy" orderType={orderType} currency={currency} symbol={symbol} balance={1250.00} currentPrice={price} disabled={!isLoggedIn}
                            showTPSL={showTPSL}
                            onToggleTPSL={setShowTPSL}
                        />
                    </TabsContent>
                    <TabsContent value="sell" className="mt-0 h-full">
                        <OrderInputSection
                            side="sell" orderType={orderType} currency={currency} symbol={symbol} balance={0.45} currentPrice={price} disabled={!isLoggedIn}
                            showTPSL={showTPSL}
                            onToggleTPSL={setShowTPSL}
                        />
                    </TabsContent>
                </Tabs>
            </div>


            {/* WIDE SCREEN: PARALLEL */}
            <div className="hidden xl:grid xl:grid-cols-2 gap-6 h-full">
                <div className="flex flex-col">
                    <div className="mb-2 text-sm font-bold text-[#0ecb81] hidden">Buy {symbol}</div>
                    {/* BUY COL */}
                    <OrderInputSection
                        side="buy" orderType={orderType} currency={currency} symbol={symbol} balance={1250.00} currentPrice={price} disabled={!isLoggedIn}
                        showTPSL={showTPSL}
                        onToggleTPSL={setShowTPSL}
                    />
                </div>

                <div className="flex flex-col">
                    <div className="mb-2 text-sm font-bold text-[#f6465d] hidden">Sell {symbol}</div>
                    {/* SELL COL */}
                    <OrderInputSection
                        side="sell" orderType={orderType} currency={currency} symbol={symbol} balance={0.45} currentPrice={price} disabled={!isLoggedIn}
                        showTPSL={showTPSL}
                        onToggleTPSL={setShowTPSL}
                    />
                </div>

            </div>

        </div>
    )
}