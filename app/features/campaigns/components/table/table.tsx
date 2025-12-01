"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Campaign, CampaignStatusAction } from "../../types";
import { cancelCampaign, pauseCampaign, resumeCampaign } from "../../services";
import { DataTable } from "./data-table";
import { getCampaignColumns } from "./columns";

const confirmationCopy: Record<CampaignStatusAction, { title: string; description: string }> = {
  pause: {
    title: "Pause campaign?",
    description:
      "Leads will stop receiving emails until you resume the campaign. You can resume at any time.",
  },
  resume: {
    title: "Resume campaign?",
    description:
      "Emails will start sending based on the configured schedule. Make sure your content is ready.",
  },
  cancel: {
    title: "Cancel campaign?",
    description:
      "This action cannot be undone. Cancelled campaigns cannot send new emails or change status.",
  },
};

type CampaignsTableListProps = {
  campaigns: Campaign[];
  isLoading?: boolean;
};

export default function CampaignsTableList({ campaigns, isLoading }: CampaignsTableListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<{
    action: CampaignStatusAction;
    campaign: Campaign;
  } | null>(null);

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

  const isProcessing =
    pauseMutation.isPending || resumeMutation.isPending || cancelMutation.isPending;

  const handleConfirmAction = () => {
    if (!pendingAction?.campaign) return;
    const { action, campaign } = pendingAction;

    const mutation = {
      pause: pauseMutation,
      resume: resumeMutation,
      cancel: cancelMutation,
    }[action];

    mutation.mutate(campaign.id, {
      onSuccess: () => {
        toast.success(`Campaign ${action === "cancel" ? "cancelled" : `${action}d`} successfully`);
        setPendingAction(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const handleActionRequest = (action: CampaignStatusAction, campaign: Campaign) => {
    setPendingAction({ action, campaign });
  };

  const columns = getCampaignColumns({
    onView: (campaign) => router.push(`/campaigns/${campaign.id}`),
    onPause: (campaign) => handleActionRequest("pause", campaign),
    onResume: (campaign) => handleActionRequest("resume", campaign),
    onCancel: (campaign) => handleActionRequest("cancel", campaign),
  });

  const currentCopy = pendingAction ? confirmationCopy[pendingAction.action] : null;

  return (
    <>
      <DataTable columns={columns} data={campaigns} loading={isLoading} />

      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{currentCopy?.title}</AlertDialogTitle>
            <AlertDialogDescription>{currentCopy?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Keep campaign</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
