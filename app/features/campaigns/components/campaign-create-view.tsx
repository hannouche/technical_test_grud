"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CampaignForm } from "./campaign-form";
import { createCampaign } from "../services";

export function CampaignCreateView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign created successfully");
      router.push(`/campaigns/${campaign.id}`);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to create campaign. Please try again.";
      toast.error(errorMessage);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Create campaign</h1>
      </div>
      <CampaignForm
        mode="create"
        onSubmit={async (payload) => {
          await createMutation.mutateAsync(payload);
        }}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
