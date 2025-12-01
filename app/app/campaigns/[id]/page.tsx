import { CampaignDetailView } from "@/features/campaigns/components/campaign-detail-view";

interface CampaignDetailPageProps {
  params: {
    id: string;
  };
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  return (
    <div className="p-4 md:p-6">
      <CampaignDetailView campaignId={params.id} />
    </div>
  );
}
