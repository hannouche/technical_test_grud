"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { Campaign } from "../types";
import {
  approveGeneratedEmail,
  cancelCampaign,
  getCampaign,
  listGeneratedEmails,
  pauseCampaign,
  resumeCampaign,
  triggerCampaign,
} from "../services";
import { listLeads } from "@/features/leads/services";
import { DateTime } from "luxon";
import { CAMPAIGN_STATUS_ACTIONS } from "../constants";
import { WEEKLY_DAYS } from "@/constant/data";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

type CampaignDetailViewProps = {
  campaignId: string;
};

const ACTION_COPY = {
  pause: {
    title: "Pause campaign?",
    description: "Campaign emails will be paused until you resume them.",
  },
  resume: {
    title: "Resume campaign?",
    description: "The schedule will pick up from where it left off.",
  },
  cancel: {
    title: "Cancel campaign?",
    description: "Cancelled campaigns are terminal and cannot be resumed.",
  },
};

export function CampaignDetailView({ campaignId }: CampaignDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: campaign,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => getCampaign(campaignId),
  });
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: listLeads,
  });
  const {
    data: generatedEmails = [],
    isLoading: isLoadingEmails,
  } = useQuery({
    queryKey: ["campaign", campaignId, "generated-emails"],
    queryFn: () => listGeneratedEmails(campaignId),
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => pauseCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      }
    },
  });
  const resumeMutation = useMutation({
    mutationFn: (id: string) => resumeCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      }
    },
  });
  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      }
    },
  });
  const triggerMutation = useMutation({
    mutationFn: (id: string) => triggerCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["campaign", id] });
        queryClient.invalidateQueries({ queryKey: ["campaign", id, "generated-emails"] });
      }
    },
  });
  const approveMutation = useMutation({
    mutationFn: ({ campaignId: id, emailId }: { campaignId: string; emailId: string }) =>
      approveGeneratedEmail(id, emailId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["campaign", variables.campaignId, "generated-emails"],
      });
      queryClient.invalidateQueries({ queryKey: ["campaign", variables.campaignId] });
    },
  });

  const [pendingAction, setPendingAction] = useState<{
    action: "pause" | "resume" | "cancel";
    campaign: Campaign;
  } | null>(null);

  const isProcessing =
    pauseMutation.isPending || resumeMutation.isPending || cancelMutation.isPending;

  const handleAction = (action: "pause" | "resume" | "cancel") => {
    if (!campaign) return;
    setPendingAction({ action, campaign });
  };

  const confirmAction = () => {
    if (!pendingAction || !pendingAction.campaign) return;
    const { action, campaign } = pendingAction;

    let mutation;
    if (action === "pause") {
      mutation = pauseMutation;
    } else if (action === "resume") {
      mutation = resumeMutation;
    } else {
      mutation = cancelMutation;
    }

    mutation.mutate(campaign.id, {
      onSuccess: () => {
        let message = "";
        if (action === "cancel") {
          message = "Campaign cancelled successfully";
        } else if (action === "pause") {
          message = "Campaign paused successfully";
        } else {
          message = "Campaign resumed successfully";
        }
        toast.success(message);
        setPendingAction(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="space-y-4 rounded-lg border p-8 text-center">
        <p className="text-lg font-semibold">Campaign not found</p>
        <p className="text-sm text-muted-foreground">
          The campaign you are looking for does not exist or you no longer have access.
        </p>
        <Button variant="outline" onClick={() => router.push("/campaigns")}>
          Back to campaigns
        </Button>
      </div>
    );
  }

  const weeklyDaysList = (campaign.weeklyDays ?? [])
    .map((day) => WEEKLY_DAYS.find((d) => d.value === day)?.label)
    .filter(Boolean)
    .join(", ");

  const scheduleDescription =
    campaign.scheduleType === "DAILY"
      ? `${campaign.dailyEmails ?? 0} emails per day`
      : `${weeklyDaysList} • ${campaign.weeklyEmailsPerDay ?? 0} emails`;

  const modelLabel = campaign.model || "Unassigned";
  const timeZone = campaign.timezone || campaign.timeZone || "UTC";
  const startDate = DateTime.fromISO(campaign.startDateUtc).setZone(timeZone);

  const statusActions = CAMPAIGN_STATUS_ACTIONS[campaign.status];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold">{campaign.name}</h1>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          <p className="text-muted-foreground">Model: {modelLabel} • {scheduleDescription}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/campaigns/${campaign.id}/edit`}>Edit</Link>
          </Button>
          {statusActions.canPause && (
            <Button variant="outline" onClick={() => handleAction("pause")}>
              Pause
            </Button>
          )}
          {statusActions.canResume && (
            <Button variant="outline" onClick={() => handleAction("resume")}>
              Resume
            </Button>
          )}
          {statusActions.canCancel && (
            <Button variant="destructive" onClick={() => handleAction("cancel")}>
              Cancel
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() =>
              triggerMutation.mutate(campaign.id, {
                onSuccess: () => toast.success("Campaign check triggered"),
                onError: (error) => toast.error(error.message),
              })
            }
            disabled={triggerMutation.isPending}
          >
            {triggerMutation.isPending ? "Triggering..." : "Trigger send check"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Status" value={campaign.status} helper={startDate.toFormat("DDD")} />
        <StatCard
          label="Leads enrolled"
          value={(campaign.leadsCount ?? 0).toLocaleString()}
          helper="Across all lead sources"
        />
        <StatCard
          label="Emails scheduled"
          value={(campaign.generatedEmailsCount ?? 0).toLocaleString()}
          helper="Generated messages"
        />
        <StatCard
          label="Duration"
          value={`${campaign.durationDays} days`}
          helper={`${startDate.toFormat("MMM d")} → ${startDate
            .plus({ days: campaign.durationDays })
            .toFormat("MMM d")}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Schedule type" value={campaign.scheduleType} />
            <DetailRow label="Model" value={modelLabel} />
            <DetailRow label="Timezone" value={timeZone} />
            <DetailRow label="Start date" value={startDate.toFormat("DDD • hh:mm a ZZZZ")} />
            {campaign.scheduleType === "DAILY" ? (
              <DetailRow label="Daily emails" value={`${campaign.dailyEmails ?? 0}`} />
            ) : (
              <>
                <DetailRow label="Weekly days" value={weeklyDaysList} />
                <DetailRow
                  label="Emails per day"
                  value={`${campaign.weeklyEmailsPerDay ?? 0}`}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow
              label="Leads enrolled"
              value={(campaign.leadsCount ?? 0).toLocaleString()}
            />
            <DetailRow
              label="Emails generated"
              value={(campaign.generatedEmailsCount ?? 0).toLocaleString()}
            />
            <Button className="w-full" variant="outline" asChild>
              <Link href={`/campaigns/${campaign.id}/leads/add`}>Add leads</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {campaign.context}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leads
              .filter((lead) => lead.campaignId === campaign.id)
              .slice(0, 5)
              .map((lead) => (
                <div key={lead.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{lead.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {DateTime.fromISO(lead.createdAt).toFormat("MMM d, hh:mm a")}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {lead.firstName || lead.lastName ? `${lead.firstName ?? ""} ${lead.lastName ?? ""}` : "Lead"}
                  </span>
                </div>
              ))}
            {leads.filter((lead) => lead.campaignId === campaign.id).length === 0 && (
              <p className="text-sm text-muted-foreground">No leads enrolled yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Generated emails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingEmails && <p className="text-sm text-muted-foreground">Loading drafts...</p>}
            {!isLoadingEmails && generatedEmails.length === 0 && (
              <p className="text-sm text-muted-foreground">No generated emails yet.</p>
            )}
            {!isLoadingEmails &&
              generatedEmails.map((email) => (
                <div key={email.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{email.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        Slot {email.scheduledSlot + 1} · {DateTime.fromISO(email.createdAt).toFormat("MMM d, hh:mm a")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={email.approved ? "default" : "secondary"}>
                        {email.approved ? "Approved" : "Needs approval"}
                      </Badge>
                      {!email.approved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            approveMutation.mutate(
                              { campaignId: campaign.id, emailId: email.id },
                              {
                                onSuccess: () => toast.success("Draft approved for sending"),
                                onError: (error) => toast.error(error.message),
                              },
                            )
                          }
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending ? "Approving..." : "Approve"}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div
                    className="prose prose-sm mt-2 max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                  />
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={Boolean(pendingAction)} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction ? ACTION_COPY[pendingAction.action].title : ""}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction ? ACTION_COPY[pendingAction.action].description : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Never mind</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}
