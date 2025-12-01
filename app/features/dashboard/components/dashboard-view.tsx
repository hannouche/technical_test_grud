"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DateTime } from "luxon";
import { useQuery } from "@tanstack/react-query";
import { listCampaigns } from "@/features/campaigns/services";
import { listLeads } from "@/features/leads/services";

export function DashboardView() {
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => listCampaigns(),
  });
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: listLeads,
  });

  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "ACTIVE");
  const pausedCampaigns = campaigns.filter((campaign) => campaign.status === "PAUSED");

  const upcomingCampaigns = [...campaigns]
    .sort(
      (a, b) =>
        new Date(a.startDateUtc).getTime() - new Date(b.startDateUtc).getTime(),
    )
    .slice(0, 5);

  const leadGrowth = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            High-level overview of your campaigns and lead activity.
          </p>
        </div>
        <Button asChild>
          <Link href="/campaigns/new">Create campaign</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total campaigns" value={campaigns.length} helper={`${activeCampaigns.length} active`} />
        <StatCard label="Paused campaigns" value={pausedCampaigns.length} helper="Need attention" />
        <StatCard label="Total leads" value={leads.length} helper={`${leadGrowth.length} recent`} />
        <StatCard label="Active sequences" value={activeCampaigns.length} helper="running now" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingCampaigns.length ? (
              upcomingCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Starts {DateTime.fromISO(campaign.startDateUtc).toFormat("MMM dd, hh:mm a")} (
                      {campaign.timezone})
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/campaigns/${campaign.id}`}>View</Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No campaigns scheduled.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leadGrowth.length ? (
              leadGrowth.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{lead.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {DateTime.fromISO(lead.createdAt).toFormat("MMM dd, hh:mm a")}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/campaigns/${lead.campaignId}`}>Campaign</Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent leads.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </CardContent>
    </Card>
  );
}
