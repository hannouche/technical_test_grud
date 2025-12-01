"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LeadFiltersState } from "../types";
import { LeadFilters } from "./lead-filters";
import { LeadTable } from "./lead-table";
import { listLeads } from "../services";
import { listCampaigns } from "@/features/campaigns/services";

export function LeadsView() {
  const [filters, setFilters] = useState<LeadFiltersState>({ search: "" });
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: listLeads,
  });
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => listCampaigns(),
  });

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCampaign = filters.campaignId ? lead.campaignId === filters.campaignId : true;
    return matchesSearch && matchesCampaign;
  });

  const campaignLookup: Record<string, string> = {};
  for (const campaign of campaigns) {
    campaignLookup[campaign.id] = campaign.name;
  }

  const defaultCampaignId = campaigns[0]?.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Leads</h1>
          <p className="text-muted-foreground">
            View every contact enrolled in your campaigns.
          </p>
        </div>
        <Button asChild disabled={!defaultCampaignId}>
          <Link href={defaultCampaignId ? `/campaigns/${defaultCampaignId}/leads/add` : "#"}>
            Add lead
          </Link>
        </Button>
      </div>

      <LeadFilters
        filters={filters}
        campaigns={campaigns}
        onChange={setFilters}
        onReset={() => setFilters({ search: "" })}
      />

      <LeadTable leads={filteredLeads} campaignLookup={campaignLookup} isLoading={isLoading} />
    </div>
  );
}
