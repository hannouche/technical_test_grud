"use client"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../../ui/sidebar'
import { useSidebar } from '../../ui/sidebar'
export default function NavLogo() {

  const { state } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <div className="flex items-center gap-2 w-full">
            <div className="flex justify-center items-center gap-0.5 leading-none w-full">
              <span className="font-semibold text-xl w-full text-center"> {state === "expanded" ? "Grude Solutions" : "G"}</span>
            </div>
          </div>
        </SidebarMenuButton> 
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
