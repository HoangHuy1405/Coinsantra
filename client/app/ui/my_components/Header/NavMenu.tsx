'use client'
import React from 'react'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '../../shadcn/navigation-menu'
import { Menu } from '@/app/types/Menu'
import Link from 'next/link'

export default function NavMenu({ menu }: { menu: Menu[] }) {
    return (
        <NavigationMenu viewport={false}>
            <NavigationMenuList>
                {menu.map((item) => (
                    <NavigationMenuItem key={item.id}>
                        {item.subMenu && item.subMenu.length > 0 ? (
                            <>
                                <NavigationMenuTrigger variant='link'>{item.title}</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[300px] gap-4">
                                        <li>
                                            {item.subMenu.map((child) => (
                                                <NavigationMenuLink
                                                    key={child.id}
                                                    variant='link'
                                                    asChild>
                                                    <Link href={child.path ?? "#"}>
                                                        <div className="font-medium">{child.title}</div>
                                                        <div className="text-muted-foreground text-xs">{child.description}</div>
                                                    </Link>
                                                </NavigationMenuLink>
                                            ))}
                                        </li>
                                    </ul>
                                </NavigationMenuContent>
                            </>
                        ) : (
                            <NavigationMenuLink
                                asChild
                                className={navigationMenuTriggerStyle({
                                    variant: "link"
                                })}>
                                <Link key={item.id} href={item.path ?? "#"}>{item.title}</Link>
                            </NavigationMenuLink>
                        )}
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    )
}
