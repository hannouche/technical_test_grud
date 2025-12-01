"use client"

import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { SidebarItem } from "@/routes/index"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { useState, useCallback, useMemo } from "react"

export function NavMain({
  items,
}: {
  items: SidebarItem[]
}) {
  const pathname = usePathname()
  const {store_domain} = useParams()
  const [clickedItem, setClickedItem] = useState<SidebarItem | null>(null)
  
  const isItemHidden = useCallback((item: SidebarItem) => {
    if (item.hide) return true
    return false
  }, [])

  const areAllChildrenHidden = useCallback((item: SidebarItem) => {
    if (!item.items || item.items.length === 0) return false
    return item.items.every(child => isItemHidden(child))
  }, [isItemHidden])

  const visibleItems = useMemo(() => {
    return items.filter(item => {
      // If item itself is hidden, don't show it
      if (isItemHidden(item)) return false
      
      // If item is collapsible and all children are hidden, don't show it
      if (item.isCollapsible && areAllChildrenHidden(item)) return false
      
      return true
    })
  }, [items, isItemHidden, areAllChildrenHidden])

  const isRouteActive = useCallback((itemUrl: string | undefined) => {
    if (!itemUrl) return false
    const fullPath = itemUrl.startsWith('/') ? itemUrl : `/${itemUrl}`
    
    // Special handling for settings routes
    if (pathname.includes('/settings')) {
      const settingsPath = pathname.split('/settings')[1] || '/'
      return settingsPath === fullPath
    }
    
    const currentPath = store_domain ? pathname.replace(`/${store_domain}`, '') : pathname
    return currentPath === fullPath
  }, [pathname, store_domain])

  const handleItemClick = useCallback((item: SidebarItem) => {
    if (!isRouteActive(item.url)) {
      setClickedItem(item)
      // Clear clicked state after animation
      setTimeout(() => setClickedItem(null), 200)
    }
  }, [isRouteActive])

  const getItemHref = useCallback((item: SidebarItem) => {
    if (!item.url) return '#'
    
    if (item.isExternal && item.url === '/settings') {
      return `/settings/${store_domain}`
    }
    
    if (pathname.includes('/settings')) {
      return `/settings/${store_domain}${item.url}`
    }
    
    return item.isExternal ? 
           `${item.url}/${store_domain}` : 
           store_domain ? `/${store_domain}${item.url}` : item.url
  }, [store_domain, pathname])


  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Store</SidebarGroupLabel> */}
      <SidebarMenu className="space-y-1">
        {visibleItems.map((item) => (
          item.isCollapsible ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={false}
              className="group/collapsible"
              hidden={item.hide}
            >
              <SidebarMenuItem>
                {item.items && item.items?.length > 0 ? (
                  <CollapsibleTrigger asChild>
                    <Link 
                      href={getItemHref(item)}
                      prefetch={true}
                      onClick={(e) => {
                        if (isRouteActive(item.url)) {
                          e.preventDefault()
                          return
                        }
                        handleItemClick(item)
                      }}
                    >
                      <SidebarMenuButton
                        isActive={isRouteActive(item.url)}
                        className={cn(
                          "relative transition-all duration-200 group hover:bg-accent/50",
                          isRouteActive(item.url) && [
                            "bg-primary/10 text-primary font-medium shadow-sm",
                            "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                            "before:w-1 before:h-6 before:bg-primary before:rounded-r-full",
                            "after:absolute after:inset-0 after:bg-primary/5 after:rounded-md",
                          ],
                          clickedItem === item && "scale-[0.98] bg-accent/30",
                        )}
                      >
                        {item.icon && (
                          <item.icon
                            className={cn("transition-colors duration-200", isRouteActive(item.url) && "text-primary")}
                          />
                        )}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </Link>
                  </CollapsibleTrigger>
                ) : (
                  <Link 
                    href={getItemHref(item)}
                    prefetch={true}
                    onClick={(e) => {
                      if (isRouteActive(item.url)) {
                        e.preventDefault()
                        return
                      }
                      handleItemClick(item)
                    }}
                  >
                    <SidebarMenuButton
                      isActive={isRouteActive(item.url)}
                      className={cn(
                        "relative transition-all duration-200 group hover:bg-accent/50",
                        isRouteActive(item.url) && [
                          "bg-primary/10 text-primary font-medium shadow-sm",
                          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                          "before:w-1 before:h-6 before:bg-primary before:rounded-r-full",
                          "after:absolute after:inset-0 after:bg-primary/5 after:rounded-md",
                        ],
                        clickedItem === item && "scale-[0.98] bg-accent/30",
                      )}
                    >
                      {item.icon && (
                        <item.icon
                          className={cn("transition-colors duration-200", isRouteActive(item.url) && "text-primary")}
                        />
                      )}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                )}
                <CollapsibleContent>
                  <SidebarMenuSub hidden={!item.items}>
                    {item.items && item.items?.filter(subItem => !isItemHidden(subItem)).map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={cn(
                            "relative transition-all duration-200 ml-4",
                            isRouteActive(subItem.url) && [
                              "bg-primary/5 text-primary font-medium",
                              "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                              "before:w-0.5 before:h-4 before:bg-primary/60 before:rounded-full",
                            ],
                          )}
                        >
                          <Link 
                            href={getItemHref(subItem)}
                            prefetch={true}
                            onClick={(e) => {
                              if (isRouteActive(subItem.url)) {
                                e.preventDefault()
                                return
                              }
                              handleItemClick(subItem)
                            }}
                          >
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <Link
                className={cn(item.isDisabled && "cursor-default")}
                href={getItemHref(item)}
                prefetch={true}
                onClick={(e) => {
                  if (isRouteActive(item.url) || item.isDisabled) {
                    e.preventDefault()
                    return
                  }
                  handleItemClick(item)
                }}
              >
                <SidebarMenuButton 
                  disabled={item.isDisabled}
                  isActive={isRouteActive(item.url)}
                  className={cn(
                    "relative transition-all duration-200 group hover:bg-accent/50",
                    isRouteActive(item.url) && [
                      "bg-primary/10 text-primary font-medium shadow-sm",
                      "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                      "before:w-1 before:h-6 before:bg-primary before:rounded-r-full",
                      "after:absolute after:inset-0 after:bg-primary/5 after:rounded-md",
                    ],
                    clickedItem === item && "scale-[0.98] bg-accent/30",
                  )}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </Link>
              {item.items && item.items.length > 0 && (
                <SidebarMenuSub className={cn("!border-l-0")}>
                  {item.items.filter(subItem => !isItemHidden(subItem)).map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        className={cn(
                          "relative transition-all duration-200 ml-4",
                          isRouteActive(subItem.url) && [
                            "bg-primary/5 text-primary font-medium",
                            "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                            "before:w-0.5 before:h-4 before:bg-primary/60 before:rounded-full",
                          ],
                        )}
                      >
                        <Link 
                          href={getItemHref(subItem)}
                          prefetch={true}
                          onClick={(e) => {
                            if (isRouteActive(subItem.url)) {
                              e.preventDefault()
                              return
                            }
                            handleItemClick(subItem)
                          }}
                        >
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          )
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}