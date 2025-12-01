import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

type InputSize = "xs" | "sm" | "md" | "lg"

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize
  loading?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, size = "md", loading = false, ...props }, ref) => {
  const sizeClasses = {
    xs: "h-7 px-2 text-xs",
    sm: "h-8 px-2.5 text-sm",
    md: "h-9 px-3 text-base md:text-sm",
    lg: "h-10 px-4 text-base",
  }

  if(loading){
    return (
      <Skeleton className={cn(
        "w-full rounded-md",
        sizeClasses[size].split(' ')[0],
        className
      )} />
    )
  }

  return (
    <input
      type={type}
      className={cn(
        "flex w-full rounded-md border border-input bg-transparent py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
