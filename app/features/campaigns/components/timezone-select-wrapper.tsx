"use client";

import { useState } from "react";
import SelectSearch from "@/components/ui/select-search";
import { getAllTimezones } from "@/lib/timezones";

interface TimezoneSelectProps {
  value?: string;
  onChange?: (value: { value: string; label: string } | string) => void;
  className?: string;
}

export default function TimezoneSelect({ value, onChange, className }: TimezoneSelectProps) {
  const timezones = getAllTimezones();
  const timezoneOptions = timezones.map((tz) => {
    const label = tz.replace(/_/g, " ");
    return { value: tz, label };
  });

  const handleChange = (selectedValue: string) => {
    if (onChange) {
      const option = timezoneOptions.find((opt) => opt.value === selectedValue);
      if (option) {
        onChange({ value: option.value, label: option.label });
      } else {
        onChange(selectedValue);
      }
    }
  };

  return (
    <div className={className}>
      <SelectSearch
        data={timezoneOptions}
        value={value}
        onValueChange={handleChange}
        label="timezone"
      />
    </div>
  );
}

