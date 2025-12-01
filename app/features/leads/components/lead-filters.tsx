"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadFiltersState } from "../types";
import { Campaign } from "@/features/campaigns/types";
import { Label } from "@/components/ui/label";

type LeadFiltersProps = {
  filters: LeadFiltersState;
  campaigns: Campaign[];
  onChange: (filters: LeadFiltersState) => void;
  onReset: () => void;
};

export function LeadFilters({ filters, campaigns, onChange, onReset }: LeadFiltersProps) {
  const hasFilters = Boolean(filters.search) || Boolean(filters.campaignId);

  return (
    <div className="grid gap-4 rounded-xl border bg-card/50 p-4 md:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="lead-search">Search email</Label>
        <Input
          id="lead-search"
          placeholder="lead@company.com"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaign-filter">Filter by campaign</Label>
        <Select
          value={filters.campaignId ?? "all"}
          onValueChange={(value) =>
            onChange({
              ...filters,
              campaignId: value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger id="campaign-filter">
            <SelectValue placeholder="All campaigns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All campaigns</SelectItem>
            {campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button type="button" variant="ghost" onClick={onReset} disabled={!hasFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
