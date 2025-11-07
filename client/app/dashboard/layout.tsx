import React from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../ui/shadcn/sidebar'
import DashboarSidebar from './_components/dashboard_sidebar'
import { Separator } from '../ui/shadcn/separator'
import { ModeToggle } from '../ui/my_components/Theme/ModeToggle'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboarSidebar />

      <SidebarInset>
        <header className="flex h-16 px-10 justify-between shrink-0 items-center border-b gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-10 size-8" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          <div>
            <ModeToggle />
          </div>
        </header>
        <div className="container mx-auto py-10 px-4 sm:px-6 xl:px-8">
          {children}
        </div>
      </SidebarInset>

    </SidebarProvider >
  )
}
