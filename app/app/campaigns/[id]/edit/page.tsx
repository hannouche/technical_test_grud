import { CampaignEditView } from "@/features/campaigns/components/campaign-edit-view";

interface EditCampaignPageProps {
  params: {
    id: string;
  };
}

export default function EditCampaignPage({ params }: EditCampaignPageProps) {
  return (
    <div className="p-4 md:p-6">
      <CampaignEditView campaignId={params.id} />
    </div>
  );
}
