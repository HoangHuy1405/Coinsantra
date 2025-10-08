"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import NavMenu from "./NavMenu";
import { menuData } from "./menuData";
import { ModeToggle } from "@/app/ui/my_components/Theme/ModeToggle";
import { Button } from "@/app/ui/shadcn/button";
import TickerTape from "@/app/ui/widgets/TicketTape";
import { signOut, useSession } from "next-auth/react";
import { useSignOut } from "@/hooks/useSignOut";
import UserAvatar from "../UserAvatar";

export default function Header() {
  const { data: session, status } = useSession();
  const { mutate: signOutUser, isPending } = useSignOut();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20); // cuộn xuống 20px thì bật border
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-background/70 backdrop-blur-sm
        supports-[backdrop-filter]:bg-background/60 transition-colors
        ${scrolled ? "border-b border-border" : "border-b border-transparent"}`}
    >
      <div className="flex flex-col">
        <div className="sticky top-0 border-border">
          <TickerTape />
        </div>
        <div
          className="container mx-auto flex h-16 items-center justify-between
            px-4 md:px-8"
        >
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6">
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
            <div className="hidden md:block">
              <NavMenu menu={menuData} />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {status === "authenticated" ? (
              <div className="flex items-center gap-3">
                {/* User Avatar + Name */}
                <div className="flex items-center gap-2">
                  <Link href="/profile">
                    <UserAvatar
                      avatarUrl={session.user.avatarUrl}
                      fullname={session.user.fullname}
                      username={session.user.username}
                      size={32}
                    />
                    <span className="text-sm font-medium">
                      {session.user.username}
                    </span>
                  </Link>
                </div>

                {/* Sign Out Button */}
                <Button
                  size="sm"
                  onClick={() => signOutUser()}
                  disabled={isPending}
                >
                  {isPending ? "Logging out..." : "Sign Out"}
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/login?mode=login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/login?mode=register">Sign Up</Link>
                </Button>
              </div>
            )}
            <ModeToggle />
            <button
              className="sm:hidden inline-flex items-center justify-center
                rounded-md p-2 hover:bg-accent"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="sm:hidden border-t bg-card/95 backdrop-blur px-4 pb-4">
            <div className="mt-4 flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/login?mode=login">Login</Link>
              </Button>
              <Button asChild size="sm" className="w-full">
                <Link href="/login?mode=register">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
