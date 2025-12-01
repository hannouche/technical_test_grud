import { User } from "@/app/layout"
import { NavMain } from "@/components/layouts/dashboard/nav-main"
import { NavUser } from "@/components/layouts/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { sidebarItems } from "@/routes/index"
import * as React from "react"
import NavLogo from "./nav-logo"



export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user : User } ) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      {/* <SidebarHeader>
        <TeamSwitcher stores={stores} user={user} />
      </SidebarHeader> */}
      <SidebarContent>
        <NavMain items={sidebarItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
