"use client"

import type React from "react"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DomainInputProps {
  domainPrefix?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  helperText?: string
  defaultValue?: string
}

export default function DomainInput({
  domainPrefix = `${process.env.NEXT_PUBLIC_APP_URL}/`,
  onChange,
  placeholder = "your-store",
  label = "Store URL",
  helperText = "Choose a unique URL for your store",
  defaultValue = "",
}: DomainInputProps) {
  const [value, setValue] = useState(defaultValue)
  const [isValid, setIsValid] = useState<boolean | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
    setValue(newValue)

    const valid = newValue.length > 0 && /^[a-z0-9-]+$/.test(newValue)
    setIsValid(newValue.length > 0 ? valid : null)

    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <div className="space-y-2 w-full max-w-md">
      <Label htmlFor="domain-input">{label}</Label>
      <div className="flex items-stretch rounded-md border overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="bg-muted px-3 py-2 text-sm flex items-center border-r">{domainPrefix}</div>
        <Input
          id="domain-input"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {isValid !== null && (
          <div className="px-3 flex items-center">
            {isValid ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
          </div>
        )}
      </div>

      {helperText && <p className="text-sm text-muted-foreground">{helperText}</p>}

      {value && (
        <div className="text-sm font-medium">
          Full URL: {domainPrefix}
          {value}
        </div>
      )}
    </div>
  )
}
