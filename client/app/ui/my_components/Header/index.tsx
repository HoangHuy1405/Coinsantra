"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

import NavMenu from "./NavMenu"
import { menuData } from "./menuData"
import { ModeToggle } from "../Theme/ModeToggle"
import { Button } from "../../shadcn/button"

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
                {/* Left: Logo + Nav */}
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            className="dark:invert"
                            src="/next.svg"
                            alt="Next.js logo"
                            width={120}
                            height={28}
                            priority
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:block">
                        <NavMenu menu={menuData} />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Desktop buttons */}
                    <div className="hidden sm:flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="#">Login</Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="#">Sign Up</Link>
                        </Button>
                    </div>

                    <ModeToggle />

                    {/* Mobile menu toggle */}
                    <button
                        className="sm:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-accent"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Dropdown */}
            {mobileOpen && (
                <div className="sm:hidden border-t bg-card/95 backdrop-blur px-4 pb-4">
                    <div className="mt-4 flex flex-col gap-2">
                        <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href="#">Login</Link>
                        </Button>
                        <Button asChild size="sm" className="w-full">
                            <Link href="#">Sign Up</Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    )
}
