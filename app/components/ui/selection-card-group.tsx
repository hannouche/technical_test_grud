"use client"

import { cn } from "@/lib/utils"
import { CircleCheckBig } from "lucide-react"
import Image from "next/image"
import type React from "react"
import { Skeleton } from "./skeleton"

export interface SelectionOption {
  id: string
  name: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface SelectionCardGroupProps {
  options: SelectionOption[]
  selectedId?: string
  onChange: (id: string) => void
  label?: string
  required?: boolean
  className?: string
  cardClassName?: string
  checkmarkClassName?: string,
  loadingDeliveryCompanies?: boolean
}

export function SelectionCardGroup({
  options,
  selectedId,
  onChange,
  label,
  required = false,
  className,
  cardClassName,
  checkmarkClassName,
  loadingDeliveryCompanies,
}: SelectionCardGroupProps) {
  const handleSelect = (id: string, disabled?: boolean) => {
    if (!disabled) {
      onChange(id)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="mb-2 font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </div>
      )}
      <div className="border rounded-lg overflow-hidden">
        {loadingDeliveryCompanies && (
          Array.from({length: 2}).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
              <Skeleton className="w-full h-10" />
            </div>
          ))
        )}
        {!loadingDeliveryCompanies && options.map((option, index) => (
          <div
            key={option.id}
            className={cn(
              "flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900",
              index < options.length - 1 && "border-b",
              option.disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
              cardClassName,
              selectedId === option.id && "bg-gray-100 dark:bg-gray-900"
            )}
            onClick={() => handleSelect(option.id, option.disabled)}
          >
            <div className="flex items-center gap-3">
              {/* {option.icon} */}
              <Image src={`/delivery_companies/${option.icon}`} alt={option.name} width={20} height={20} />
              <span className="font-medium">{option.name}</span>
            </div>
              <div
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-blue-500 duration-300 opacity-0",
                  checkmarkClassName,
                  selectedId === option.id && "opacity-100"
                )}
              >
                <CircleCheckBig className="w-9 h-9" />
              </div>
          </div>
        ))}
      </div>
    </div>
  )
}
