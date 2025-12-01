import {
  LayoutDashboard,
  Mail,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface SidebarItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  items?: SidebarItem[];
  isActive?: boolean;
  isExternal?: boolean;
  isCollapsible?: boolean;
  isDisabled?: boolean;
  hide?: boolean;
}

export interface SidebarItemWithOptions {
  name: string;
  url: string;
  icon?: LucideIcon;
  hide?: boolean;
  active?: boolean;
  options?: {
    name: string;
    href?: string;
    icon?: LucideIcon;
    action?: () => void;
    separator?: boolean;
    hide?: boolean;
  }[];
}

export const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Campaigns",
    url: "/campaigns",
    icon: Mail,
  },
  {
    title: "Leads",
    url: "/leads",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];
