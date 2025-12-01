"use client"

import * as React from 'react'
import { ChevronsUpDown, Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export type MultiSelectOption = { label: string; value: string }

type MultiSelectProps = {
  options: MultiSelectOption[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select options',
  className,
  disabled
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  const buttonLabel = React.useMemo(() => {
    if (!value || value.length === 0) return placeholder
    if (value.length === 1) return options.find((o) => o.value === value[0])?.label || placeholder
    return value.map((v) => options.find((o) => o.value === v)?.label).join(', ')
  }, [value, options, placeholder])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          <span className="truncate text-left">{buttonLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search..." className="h-9" />
          <CommandList>
            <CommandEmpty>No options.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const checked = value.includes(opt.value)
                return (
                  <CommandItem key={opt.value} value={opt.label} onSelect={() => toggle(opt.value)} className="gap-2">
                    <Checkbox checked={checked} onCheckedChange={() => toggle(opt.value)} />
                    <span className="truncate">{opt.label}</span>
                    <Check className={cn('ml-auto h-4 w-4', checked ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


