"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { MinusIcon, PlusIcon } from "lucide-react"

interface NumberInputProps {
  initialValue?: number
  min?: number
  max?: number
  onChange?: (value: number) => void
}

export default function NumberInput({ initialValue = 2, min = 0, max = 100, onChange }: NumberInputProps) {
  const [value, setValue] = useState(initialValue)

  const [localMin, localMax] = useMemo(() => {
    if (min <= max) return [min, max]
    return [max, min]
  }, [min, max])

  useEffect(() => {
    const clamped = Math.max(localMin, Math.min(localMax, initialValue))
    setValue(clamped)
  }, [initialValue, localMin, localMax])

  const decrement = () => {
    if (value > localMin) {
      const newValue = value - 1
      setValue(newValue)
      onChange?.(newValue)
    }
  }

  const increment = () => {
    if (value < localMax) {
      const newValue = value + 1
      setValue(newValue)
      onChange?.(newValue)
    }
  }

  return (
    <div className="flex items-center border rounded-md overflow-hidden">
      <Button type="button" variant="ghost" size="icon" onClick={decrement} className="h-6 w-6 rounded-none border-r">
        <MinusIcon className="h-2 w-2" />
      </Button>
      <div className="px-3 py-[1px] text-center min-w-[2rem] text-sm">{value}</div>
      <Button type="button" variant="ghost" size="icon" onClick={increment} className="h-6 w-6 rounded-none border-l">
        <PlusIcon className="h-2 w-2" />
      </Button>
    </div>
  )
}
