import { Menu } from "@/app/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Markets",
    path: "/market",
  },
  {
    id: 2,
    title: "AI bots",
    path: "/ai-bots",
  },
  {
    id: 3,
    title: "Trade",
    subMenu: [
      {
        id: 31,
        title: "Spot",
        path: "/trade",
        description: "Trade crypto with the classic spot interface",
      },
      {
        id: 32,
        title: "Margin",
        path: "/trade/margin",
        description: "Trade with leverage on margin markets",
      },
      {
        id: 33,
        title: "Convert",
        path: "/trade/convert",
        description: "Fast crypto swaps with zero fees",
      },
      {
        id: 34,
        title: "P2P",
        path: "/trade/p2p",
        description: "Buy & sell crypto directly with other users",
      },
    ],
  },
  {
    id: 4,
    title: "Futures",
    subMenu: [
      {
        id: 41,
        title: "USDⓈ-M Futures",
        path: "/futures/usdm",
        description:
          "Perpetual and quarterly contracts settled in USDT or BUSD",
      },
      {
        id: 42,
        title: "COIN-M Futures",
        path: "/futures/coinm",
        description: "Contracts settled in cryptocurrency",
      },
      {
        id: 43,
        title: "Battle",
        path: "/futures/battle",
        description: "Compete with traders in futures battles",
      },
    ],
  },
  {
    id: 5,
    title: "Earn",
    subMenu: [
      {
        id: 51,
        title: "Simple Earn",
        path: "/earn/simple",
        description: "Earn daily rewards from your crypto",
      },
      {
        id: 52,
        title: "Launchpool",
        path: "/earn/launchpool",
        description: "Stake tokens to farm new assets",
      },
      {
        id: 53,
        title: "Staking",
        path: "/earn/staking",
        description: "Stake your crypto for higher rewards",
      },
      {
        id: 54,
        title: "Dual Investment",
        path: "/earn/dual",
        description: "Commit funds to earn in different market scenarios",
      },
    ],
  },
  {
    id: 6,
    title: "Wallet",
    subMenu: [
      {
        id: 61,
        title: "Overview",
        path: "my/wallet/overview",
        description: "Check balances and asset distribution",
      },
      {
        id: 62,
        title: "Fiat & Spot",
        path: "my/wallet/spot",
        description: "Deposit & withdraw your funds",
      },
      {
        id: 63,
        title: "Margin",
        path: "my/wallet/margin",
        description: "View margin balances and risks",
      },
      {
        id: 64,
        title: "Futures",
        path: "my/wallet/futures",
        description: "Manage your futures balances",
      },
    ],
  },
  {
    id: 7,
    title: "More",
    subMenu: [
      {
        id: 71,
        title: "Referral",
        path: "/referral",
        description: "Invite friends and earn commission from their trading",
      },
      {
        id: 72,
        title: "Vouchers",
        path: "/vouchers",
        description: "Claim rewards, vouchers, and join promotions",
      },
      {
        id: 73,
        title: "Support",
        path: "/support",
        description: "Help center, FAQs, and 24/7 customer support",
      },
      {
        id: 74,
        title: "Academy",
        path: "/academy",
        description: "Learn crypto basics with free educational resources",
      },
    ],
  },
];
