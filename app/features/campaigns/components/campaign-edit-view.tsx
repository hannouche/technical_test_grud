"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { CampaignForm } from "./campaign-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getCampaign, updateCampaign } from "../services";
import { CampaignPayload } from "../validators";

type CampaignEditViewProps = {
  campaignId: string;
};

export function CampaignEditView({ campaignId }: CampaignEditViewProps) {
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CampaignPayload }) =>
      updateCampaign(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", updated.id] });
      toast.success("Campaign updated successfully");
      router.push(`/campaigns/${updated.id}`);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to update campaign. Please try again.";
      toast.error(errorMessage);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="space-y-4 rounded-lg border p-6 text-center">
        <p className="font-medium">Unable to load campaign details.</p>
        <p className="text-sm text-muted-foreground">
          The campaign may have been deleted or you might not have permission to edit it.
        </p>
        <Button variant="outline" onClick={() => router.push("/campaigns")}>
          Back to campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Edit campaign</h1>
          <p className="text-muted-foreground">
            Update schedule, timing, and configuration for "{campaign.name}".
          </p>
        </div>
        <CampaignStatusBadge status={campaign.status} />
      </div>
      <CampaignForm
        mode="edit"
        campaign={campaign}
        onSubmit={(payload) => updateMutation.mutateAsync({ id: campaignId, data: payload })}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
