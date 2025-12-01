"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LeadForm } from "./lead-form";
import { listCampaigns } from "@/features/campaigns/services";
import { createLead } from "../services";

type AddLeadViewProps = {
  campaignId?: string;
};

export function AddLeadView({ campaignId }: AddLeadViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: campaigns = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => listCampaigns(),
  });
  const createLeadMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load campaigns</AlertTitle>
        <AlertDescription>
          Please refresh the page or try again in a few minutes.
        </AlertDescription>
      </Alert>
    );
  }

  if (!campaigns.length) {
    return (
      <Alert>
        <AlertTitle>No campaigns found</AlertTitle>
        <AlertDescription>
          Create a campaign before adding leads so that we can associate them.
        </AlertDescription>
        <Button className="mt-4" onClick={() => router.push("/campaigns/new")}>
          Create campaign
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Add leads</h1>
          <p className="text-muted-foreground">
            Enroll one or more contacts into {campaignId ? "this campaign" : "one of your campaigns"}.
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <LeadForm
        campaigns={campaigns}
        defaultCampaignId={campaignId}
        isSubmitting={createLeadMutation.isPending}
        onSubmit={async (values) => {
          try {
            const { leads } = await createLeadMutation.mutateAsync(values);
            toast.success(
              leads.length > 1 ? `${leads.length} leads added successfully` : "Lead added successfully",
            );
            if (campaignId) {
              router.push(`/campaigns/${campaignId}`);
            } else if (leads[0]?.campaignId) {
              router.push(`/campaigns/${leads[0].campaignId}`);
            } else {
              router.push("/leads");
            }
          } catch (error) {
            if (error instanceof Error) {
              toast.error(error.message);
            } else {
              toast.error("Unable to add lead");
            }
          }
        }}
      />
    </div>
  );
}
