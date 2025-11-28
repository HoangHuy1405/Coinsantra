"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/app/ui/shadcn/sidebar";
import React from "react";
import NavMain, { NavMainProps } from "./nav_main";
import { Home, LucideLayoutDashboard } from "lucide-react";
import { Wallet } from "lucide-react";
import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/app/ui/shadcn/button";

const navData: NavMainProps = {
  items: [
    {
      title: "Profile",
      url: "/my/profile",
      isActive: true,
      icon: User,
    },
    {
      title: "Dashboard",
      url: "/my/dashboard",
      icon: LucideLayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Coins",
          url: "/coins",
          adminOnly: true,
        },
        {
          title: "Saas",
          url: "/saas",
        },
        {
          title: "AI bots",
          url: "/ai-bots/overview",
          adminOnly: true,
        },
      ],
    },
    {
      title: "Wallet",
      url: "/my/wallet",
      icon: Wallet,
      items: [
        {
          title: "Overview",
          url: "/overview",
        },
        {
          title: "Trade",
          url: "/trade",
        },
        {
          title: "AI trade",
          url: "/ai-trade",
        },
        {
          title: "History",
          url: "/history",
        },
      ],
    },
  ],
};

export default function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes("ADMIN");

  const filteredNavItems = navData.items
    .map((item) => {
      const filteredChildren = item.items?.filter((child) => {
        if (child.adminOnly && !isAdmin) return false;
        return true;
      });

      return { ...item, items: filteredChildren };
    })
    .filter((item) => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.items && item.items.length === 0) return false;
      return true;
    });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader></SidebarHeader>

      <SidebarContent>
        <NavMain items={filteredNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <Link href="/" className="w-full">
          <Button variant="outline" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </Link>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
