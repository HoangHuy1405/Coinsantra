import React from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../ui/shadcn/sidebar";
import DashboardSidebar from "./_components/dashboard_sidebar";
import { Separator } from "../ui/shadcn/separator";
import { ModeToggle } from "../ui/my_components/Theme/ModeToggle";
import { UserNav } from "../(root)/_components/Header/UserNav";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-option";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <SidebarProvider>
      <DashboardSidebar />

      <SidebarInset>
        <header
          className="flex h-16 px-10 justify-between shrink-0 items-center
            border-b gap-2 transition-[width,height] ease-linear
            group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
        >
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-10 size-8" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <div>
            <ModeToggle />
            <UserNav user={{
              name: session?.user?.fullname,
              username: session?.user?.username,
              email: session?.user?.email,
              image: session?.user?.avatarUrl
            }} />
          </div>
        </header>
        <div className="container mx-auto py-10 px-4 sm:px-6 xl:px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
