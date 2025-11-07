"use client"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/ui/shadcn/collapsible'
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/app/ui/shadcn/sidebar'
import { ChevronRight, LucideIcon } from 'lucide-react'

interface NavMainProps {
    items: {
        title: string
        url: string
        icon?: LucideIcon
        isActive?: boolean
        items?: {
            title: string
            url: string
        }[]
    }[]
}

export default function NavMain({ items }: NavMainProps) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>MENU</SidebarGroupLabel>

            <SidebarMenu >
                {items.map((item) => (
                    <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={item.isActive}
                        className="group/collapsible"
                    >
                        <SidebarMenuItem >
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton className="text-base h-10" tooltip={item.title}>
                                    {item.icon && <item.icon />}
                                    <span className="pl-2">{item.title}</span>
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent >
                                <SidebarMenuSub className="pl-5">
                                    {item.items?.map((subItem) => (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton asChild className="text-base h-8">
                                                <a href={`${item.url}/${subItem.url}`}>
                                                    <span >{subItem.title}</span>
                                                </a>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
