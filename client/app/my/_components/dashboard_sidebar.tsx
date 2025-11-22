"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/app/ui/shadcn/sidebar";
import React from "react";
import NavMain from "./nav_main";
import { LucideLayoutDashboard } from "lucide-react";
import { Wallet } from "lucide-react";
import { User } from "lucide-react";

const navData = {
  navMain: [
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
        },
        {
          title: "Saas",
          url: "/saas",
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader></SidebarHeader>

      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>

      <SidebarFooter></SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
