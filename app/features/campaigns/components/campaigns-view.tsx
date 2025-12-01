"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CampaignStatus } from "@/features/campaigns/types";
import { CampaignFiltersState, Campaign, CampaignListFilters } from "../types";
import { CAMPAIGN_STATUS_ORDER } from "../constants";
import { listCampaigns } from "../services";
import { CampaignFilters } from "./table/campaign-filters";
import CampaignsTableList from "./table/table";

const defaultFilters: CampaignFiltersState = {
  status: "ALL",
  search: "",
  from: undefined,
  to: undefined,
  sortBy: "createdAt",
  sortDirection: "desc",
};

const statusOrderMap = CAMPAIGN_STATUS_ORDER.reduce<Record<CampaignStatus, number>>(
  (acc, status, index) => {
    acc[status] = index;
    return acc;
  },
  {
    DRAFT: CAMPAIGN_STATUS_ORDER.length,
    ACTIVE: CAMPAIGN_STATUS_ORDER.length,
    PAUSED: CAMPAIGN_STATUS_ORDER.length,
    COMPLETED: CAMPAIGN_STATUS_ORDER.length,
    CANCELLED: CAMPAIGN_STATUS_ORDER.length,
  },
);

export function CampaignsView() {
  const [filters, setFilters] = useState<CampaignFiltersState>(defaultFilters);

  const queryFilters: CampaignListFilters = {
    status: filters.status === "ALL" ? undefined : filters.status,
    from: filters.from?.toISOString(),
    to: filters.to?.toISOString(),
    search: filters.search || undefined,
  };

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns", queryFilters],
    queryFn: () => listCampaigns(queryFilters),
  });

  const sortedCampaigns = sortCampaigns(campaigns, filters);
  const metrics = buildMetrics(campaigns);

  const handleResetFilters = () => setFilters({ ...defaultFilters });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Campaigns</h1>
          <p className="text-muted-foreground">
            Monitor performance, tweak schedules, and keep your pipeline healthy.
          </p>
        </div>
        <Button asChild>
          <Link href="/campaigns/new">New campaign</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{metric.value}</div>
              {metric.helper && <p className="text-xs text-muted-foreground">{metric.helper}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <CampaignFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={handleResetFilters}
      />

      <CampaignsTableList campaigns={sortedCampaigns} isLoading={isLoading} />
    </div>
  );
}

function sortCampaigns(campaigns: Campaign[], filters: CampaignFiltersState) {
  const sorted = [...campaigns].sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "status":
        comparison = (statusOrderMap[a.status] ?? 0) - (statusOrderMap[b.status] ?? 0);
        break;
      case "startDateUtc":
        comparison =
          new Date(a.startDateUtc).getTime() - new Date(b.startDateUtc).getTime();
        break;
      case "createdAt":
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return filters.sortDirection === "asc" ? comparison : -comparison;
  });

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    return sorted.filter((campaign) => campaign.name.toLowerCase().includes(searchLower));
  }

  return sorted;
}

function buildMetrics(campaigns: Campaign[]) {
  const total = campaigns.length;
  const active = campaigns.filter((campaign) => campaign.status === "ACTIVE").length;
  const paused = campaigns.filter((campaign) => campaign.status === "PAUSED").length;
  const leads = campaigns.reduce((sum, campaign) => sum + (campaign.leadsCount ?? 0), 0);
  const scheduledEmails = campaigns.reduce(
    (sum, campaign) => sum + (campaign.generatedEmailsCount ?? 0),
    0,
  );

  return [
    { label: "Total campaigns", value: total },
    { label: "Active campaigns", value: active, helper: `${paused} paused` },
    { label: "Leads enrolled", value: leads.toLocaleString() },
    { label: "Emails scheduled", value: scheduledEmails.toLocaleString() },
  ];
}
