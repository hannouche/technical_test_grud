"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { OrderLogWithRelations } from "@/types"
import { format, isToday, isYesterday } from "date-fns"
import { AlertCircle, Check, Clock, Package, ShoppingCart, Truck, X } from "lucide-react"


interface OrderTimelineProps {
  logs: OrderLogWithRelations[]
}

export function OrderTimeline({ logs }: OrderTimelineProps) {

  // Sort logs by date (newest first)
  const sortedLogs = [...logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="relative space-y-4 pl-6 md:pl-8">
      {/* Timeline vertical line */}
      <div className="absolute top-0 left-[9px] md:left-[23px] bottom-0 w-px bg-border" />

      {sortedLogs.map((log, index) => {
        const isActive = index === 0; // Most recent log is active
        return (
          <div key={log.id} className="relative">
            {/* Timeline dot with color based on action or greyed out */}
            <div
              className={cn(
                "absolute top-1.5 left-[-23px] md:left-[-17px] w-[17px] h-[17px] rounded-full border-2 border-background",
                isActive ? getActionColor(log.action) : "bg-slate-300"
              )}
            />

            <div
              className={cn(
                "mb-4",
                isActive ? "" : "opacity-60"
              )}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                    <span></span>
                  {getActionIcon(log.action)}
                  <div className="flex flex-col">
                    <span className={cn("font-medium text-xs", isActive ? "text-black" : "text-muted-foreground")}>{log.message}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                    {log.staffId && <span className="text-xs text-muted-foreground">By <span className="font-medium">{log.staff?.name}</span></span>}
                    {log.userId && <span className="text-xs text-muted-foreground">By <span className="font-medium">{log.user?.name}</span></span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={cn("whitespace-nowrap", getActionBadgeColor(log.action))}>
                    {formatAction(log.action.replace(/_/g, " "))}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}

// Helper functions
function formatDate(date: Date): string {
  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`
  } else if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`
  } else {
    return format(date, "MMM d, yyyy 'at' h:mm a")
  }
}

function formatAction(action: string): string {
  return action.charAt(0) + action.slice(1).toLowerCase()
}

function getActionIcon(action: string) {
  switch (action) {
    case "CONFIRMED_BY_CUSTOMER":
      return <Check className="h-5 w-5 text-green-500" />
    case "CREATED_BY_ADMIN":
      return <ShoppingCart className="h-5 w-5 text-muted-foreground" />
    case "ASSIGNED_TO_DELIVERY":
      return <Truck className="h-5 w-5 text-blue-500" />
    case "ASSIGNED_TO_LOCAL_DELIVERY":
      return <Truck className="h-5 w-5 text-blue-500" />
    case "NEEDS_PRODUCTION":
      return <Clock className="h-5 w-5 text-amber-500" />
    case "READY_TO_DELIVER":
      return <Package className="h-5 w-5 text-green-600" />
    case "SHIPPED":
      return <Truck className="h-5 w-5 text-blue-500" />
    case "DELIVERED":
      return <Package className="h-5 w-5 text-green-600" />
    case "CANCELLED":
      return <X className="h-5 w-5 text-red-500" />
    case "STOCK_RESERVED":
      return <Package className="h-5 w-5 text-amber-500" />
    case "STOCK_RELEASED":
      return <Package className="h-5 w-5 text-red-500" />
    case "LOCAL_DELIVERY_STATUS_UPDATED":
      return <Package className="h-5 w-5 text-blue-500" />
    case "LOCAL_DELIVERY_ASSIGNED_TO_DRIVER":
      return <Package className="h-5 w-5 text-blue-500" />
    case "LOCAL_DELIVERY_DELIVERED":
      return <Package className="h-5 w-5 text-green-600" />
    case "LOCAL_DELIVERY_CANCELLED":
      return <X className="h-5 w-5 text-red-500" />
    case "LOCAL_DELIVERY_READY":
      return <Package className="h-5 w-5 text-green-600" />
    case "LOCAL_DELIVERY_OUT_FOR_DELIVERY":
      return <Truck className="h-5 w-5 text-blue-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-muted-foreground" />
  }
}

function getActionColor(action: string): string {
  switch (action) {
    case "CONFIRMED_BY_CUSTOMER":
      return "bg-green-500"
    case "CREATED_BY_ADMIN":
      return "bg-slate-400"
    case "ASSIGNED_TO_DELIVERY":
      return "bg-blue-500"
    case "ASSIGNED_TO_LOCAL_DELIVERY":
      return "bg-blue-500"
    case "NEEDS_PRODUCTION":
      return "bg-amber-400"
    case "READY_TO_DELIVER":
      return "bg-green-600"
    case "SHIPPED":
      return "bg-blue-500"
    case "DELIVERED":
      return "bg-green-600"
    case "CANCELLED":
      return "bg-red-500"
    case "STOCK_RESERVED":
      return "bg-amber-500"
    case "STOCK_RELEASED":
      return "bg-red-500"
    case "LOCAL_DELIVERY_STATUS_UPDATED":
      return "bg-blue-500"
    case "LOCAL_DELIVERY_ASSIGNED_TO_DRIVER":
      return "bg-blue-500"
    case "LOCAL_DELIVERY_DELIVERED":
      return "bg-green-600"
    case "LOCAL_DELIVERY_CANCELLED":
      return "bg-red-500"
    case "LOCAL_DELIVERY_READY":
      return "bg-green-600"
    case "LOCAL_DELIVERY_OUT_FOR_DELIVERY":
      return "bg-blue-500"
    default:
      return "bg-slate-300"
  }
}

function getActionBadgeColor(action: string): string {
  switch (action) {
    case "CONFIRMED_BY_CUSTOMER":
      return "bg-green-100 text-green-800"
    case "CREATED_BY_ADMIN":
      return "bg-slate-100"
    case "ASSIGNED_TO_DELIVERY":
      return "bg-blue-100 text-blue-800"
    case "ASSIGNED_TO_LOCAL_DELIVERY":
      return "bg-blue-100 text-blue-800"
    case "NEEDS_PRODUCTION":
      return "bg-amber-100 text-amber-800"
    case "READY_TO_DELIVER":
      return "bg-green-100 text-green-800"
    case "SHIPPED":
      return "bg-blue-100 text-blue-800"
    case "DELIVERED":
      return "bg-green-100 text-green-800"
    case "CANCELLED":
      return "bg-red-100 text-red-800"
    case "STOCK_RESERVED":
      return "bg-amber-100 text-amber-800"
    case "STOCK_RELEASED":
      return "bg-red-100 text-red-800"
    default:
      return ""
  }
}
