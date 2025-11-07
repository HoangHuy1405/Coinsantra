"use client"

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/app/ui/shadcn/sidebar'
import React from 'react'
import NavMain from './nav_main'
import { LucideLayoutDashboard } from 'lucide-react'

const navData = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
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
    ],
}

export default function DashboarSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props} >
            <SidebarHeader>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navData.navMain} />
            </SidebarContent>

            <SidebarFooter>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}
