import { Activity } from "@/app/my/wallet/overview/_components/ActivityColumns";

export const mockActivities: Activity[] = [
  {
    id: 1,
    time: "10:34 AM",
    action: "Buy",
    coin: "BTC",
    amount: 0.0125,
    price: 43251.82,
    status: "completed",
  },
  {
    id: 2,
    time: "09:12 AM",
    action: "Sell",
    coin: "ETH",
    amount: 0.5,
    price: 2284.51,
    status: "completed",
  },
  {
    id: 3,
    time: "08:45 AM",
    action: "Buy",
    coin: "SOL",
    amount: 10,
    price: 98.32,
    status: "pending",
  },
  {
    id: 4,
    time: "Yesterday",
    action: "Sell",
    coin: "BNB",
    amount: 2.5,
    price: 312.47,
    status: "completed",
  },
  {
    id: 5,
    time: "Yesterday",
    action: "Buy",
    coin: "ADA",
    amount: 500,
    price: 0.59,
    status: "completed",
  },
];
