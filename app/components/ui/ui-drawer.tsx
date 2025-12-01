"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const drawerVariants = cva(
  "fixed inset-y-0 z-50 flex flex-col bg-background shadow-lg transition-transform duration-300 ease-in-out",
  {
    variants: {
      side: {
        right: "right-0 data-[state=closed]:translate-x-full data-[state=open]:translate-x-0 border-l",
        left: "left-0 data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 border-r",
      },
      size: {
        sm: "w-3/4 sm:max-w-sm",
        default: "w-3/4 sm:max-w-md",
        lg: "w-3/4 sm:max-w-lg",
        xl: "w-3/4 sm:max-w-xl",
        xxl: "w-3/4 sm:max-w-3xl",
        full: "w-screen",
      },
    },
    defaultVariants: {
      side: "right",
      size: "default",
    },
  },
)

const overlayVariants = cva(
  "fixed inset-0 z-40 bg-background/80 backdrop-blur-xs transition-opacity duration-300 ease-in-out !mt-0",
  {
    variants: {
      state: {
        open: "opacity-100",
        closed: "opacity-0 pointer-events-none",
      },
    },
    defaultVariants: {
      state: "closed",
    },
  },
)

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof drawerVariants> {
  isOpen: boolean
  onClose: () => void
  hideCloseButton?: boolean
  showOverlay?: boolean
  closeOnOverlayClick?: boolean
}

export function Drawer({
  children,
  className,
  isOpen,
  onClose,
  side,
  size,
  hideCloseButton = false,
  showOverlay = true,
  closeOnOverlayClick = true,
  ...props
}: DrawerProps) {
  const [state, setState] = React.useState<"open" | "closed">(isOpen ? "open" : "closed")
  const [mounted, setMounted] = React.useState(isOpen)

  React.useEffect(() => {
    if (isOpen) {
      setMounted(true)
      const timer = setTimeout(() => setState("open"), 10)
      return () => clearTimeout(timer)
    } else {
      setState("closed")
      const timer = setTimeout(() => setMounted(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      // onClose()
    }
  }

  React.useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscapeKey)
    return () => document.removeEventListener("keydown", handleEscapeKey)
  }, [isOpen, onClose])

  // Prevent body scroll when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!mounted) {
    return null
  }

  return (
    <>
      {showOverlay && <div className={overlayVariants({ state })} onClick={handleOverlayClick} aria-hidden="true" />}
      <div className={cn(drawerVariants({ side, size, className }))} data-state={state} {...props}>
        {!hideCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        )}
        {children}
      </div>
    </>
  )
}

export type DrawerHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return (
    <div className={cn("px-6 py-4 border-b", className)} {...props}>
      {props.children}
    </div>
  )
}

export type DrawerTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold", className)} {...props}>
      {props.children}
    </h2>
  )
}

export type DrawerDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {props.children}
    </p>
  )
}

export type DrawerContentProps = React.HTMLAttributes<HTMLDivElement>;

export function DrawerContent({ className, ...props }: DrawerContentProps) {
  return (
    <div className={cn("flex-1 overflow-auto p-6", className)} {...props}>
      {props.children}
    </div>
  )
}

export type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <div className={cn("px-6 py-4 border-t mt-auto ", className)} {...props}>
      {props.children}
    </div>
  )
}

