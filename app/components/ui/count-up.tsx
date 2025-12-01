"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface CountUpProps {  
  count: number
  targetCount: number
  duration: number
  className?: string
  loading?: boolean
}

export default function CountUp({count: initialCount, targetCount, duration, className, loading}: CountUpProps) {
  const [count, setCount] = useState(initialCount)
  useEffect(() => {
    const startTime = performance.now()
    const interval = setInterval(() => {
      const elapsedTime = performance.now() - startTime
      const progress = Math.min(elapsedTime / duration, 1)
      const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
      const currentCount = Math.round(targetCount * easeInOutQuad(progress))
      setCount(currentCount)
      if (progress >= 1) {
        clearInterval(interval)
      }
    }, 16)
    return () => clearInterval(interval)
  }, [targetCount, duration])
  return (
    <span className={cn(className)}>
        {loading ? 0 : count.toLocaleString()}
    </span>
  )
}
