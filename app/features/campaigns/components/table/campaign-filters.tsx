"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_FILTER_OPTIONS } from "@/features/campaigns/constants";
import { CampaignFiltersState } from "@/features/campaigns/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, SortAsc, SortDesc, X } from "lucide-react";

type CampaignFiltersProps = {
  filters: CampaignFiltersState;
  onFiltersChange: (values: CampaignFiltersState) => void;
  onReset: () => void;
};

const sortOptions: { label: string; value: CampaignFiltersState["sortBy"] }[] = [
  { label: "Name", value: "name" },
  { label: "Status", value: "status" },
  { label: "Start date", value: "startDateUtc" },
  { label: "Created date", value: "createdAt" },
];

export function CampaignFilters({ filters, onFiltersChange, onReset }: CampaignFiltersProps) {
  const handleFilterChange = (newValues: Partial<CampaignFiltersState>) => {
    onFiltersChange({ ...filters, ...newValues });
  };

  const handleDateChange = (key: "from" | "to", date?: Date) => {
    handleFilterChange({ [key]: date } as Partial<CampaignFiltersState>);
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== "ALL" ||
    Boolean(filters.from) ||
    Boolean(filters.to) ||
    filters.sortBy !== "createdAt" ||
    filters.sortDirection !== "desc";

  return (
    <div className="grid gap-4 rounded-xl border bg-card/50 p-4 md:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="campaign-search">Search by campaign name</Label>
        <Input
          id="campaign-search"
          placeholder="Acme welcome campaign"
          value={filters.search}
          onChange={(event) => handleFilterChange({ search: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status-filter">Status</Label>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            handleFilterChange({
              status: value as CampaignFiltersState["status"],
            })
          }
        >
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DateField
        label="Start date (from)"
        value={filters.from}
        onChange={(date) => handleDateChange("from", date)}
      />

      <DateField
        label="Start date (to)"
        value={filters.to}
        onChange={(date) => handleDateChange("to", date)}
      />

      <div className="space-y-2 md:col-span-3">
        <Label>Sort by</Label>
        <div className="flex flex-col gap-2 md:flex-row">
          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              handleFilterChange({
                sortBy: value as CampaignFiltersState["sortBy"],
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            className="w-full md:w-32"
            onClick={() =>
              handleFilterChange({
                sortDirection: filters.sortDirection === "asc" ? "desc" : "asc",
              })
            }
          >
            {filters.sortDirection === "asc" ? (
              <>
                <SortAsc className="mr-2 h-4 w-4" /> Asc
              </>
            ) : (
              <>
                <SortDesc className="mr-2 h-4 w-4" /> Desc
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full md:w-auto"
            onClick={onReset}
            disabled={!hasActiveFilters}
          >
            Reset filters
            <X className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

type DateFieldProps = {
  label: string;
  value?: Date;
  onChange: (date?: Date) => void;
};

function DateField({ label, value, onChange }: DateFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>Select date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(selectedDate) => onChange(selectedDate ?? undefined)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
