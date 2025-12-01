"use client"

import {
  MoreHorizontal,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SidebarItemWithOptions } from "@/routes/index"
export function NavProjects({
  projects,
}: {
  projects: SidebarItemWithOptions[]
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()

  const handleRedirect = (href: string | undefined) => {
    if (href) router.push(href)
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Resources</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link href={item.url} className={`${item.active && 'text-primary'}`} >
                {item.icon && <item.icon />}
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
              {item.options && item.options.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontal />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    {item.options?.filter(option => !option.hide).map((option) => (
                      <>
                      <DropdownMenuItem key={option.name} onClick={option.action ? option.action : (option.href && (() => handleRedirect(option.href))) || undefined}>
                        {option.icon && <option.icon className="text-muted-foreground" />}
                        <span>{option.name}</span>
                      </DropdownMenuItem>
                      {option.separator && <DropdownMenuSeparator />}
                      </>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
