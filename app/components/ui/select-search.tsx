"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createPortal } from "react-dom"


interface SelectSearchProps {
  data: { value: string, label: string }[]
  value?: string
  onValueChange?: (value: string) => void
  label?: string
}

export default function SelectSearch({ data, value, onValueChange, label }: SelectSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    setSelectedValue(value || "")
  }, [value])

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === selectedValue ? "" : currentValue
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }

  if (!mounted) return null

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between",selectedValue ? "text-foreground" : "text-muted-foreground")} >
            {selectedValue ? (() => {
              const selected = data.find((d) => d.value === selectedValue);
              if (!selected) return `Select ${label}...`;
              return selected.label.length > 35 ? `${selected.label.slice(0, 32)}...` : selected.label;
            })() : `Select ${label}...`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        {createPortal(
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            style={{ zIndex: 99999 }}
            sideOffset={4}
            align="start"
            side="bottom"
          >
            <Command
              filter={(value, search) => {
                const item = data.find((d) => d.value === value)
                if (!item) return 0
                const searchLower = search.toLowerCase()
                const labelLower = item.label.toLowerCase()
                // Search by label (location names) instead of value (timezone offsets)
                if (labelLower.includes(searchLower)) {
                  return 1
                }
                return 0
              }}
            >
              <CommandInput placeholder={`Search ${label}...`} />
              <CommandList>
                <CommandEmpty>No data found.</CommandEmpty>
                <CommandGroup>
                  {data.map((d) => (
                    <CommandItem key={d.value} value={d.value} onSelect={handleSelect}>
                      <Check
                        className={cn("mr-2 h-4 w-4", selectedValue === d.value ? "opacity-100" : "opacity-0")}
                      />
                      {d.label}
                      {/* d.label.length > 35 ? `${d.label.slice(0, 32)}...` : d.label */}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>,
          document.body,
        )}
      </Popover>
    </div>
  )
}
