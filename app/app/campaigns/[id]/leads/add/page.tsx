import { AddLeadView } from "@/features/leads/components/add-lead-view";

interface AddLeadPageProps {
  params: {
    id: string;
  };
}

export default function AddLeadPage({ params }: AddLeadPageProps) {
  return (
    <div className="p-4 md:p-6">
      <AddLeadView campaignId={params.id} />
    </div>
  );
}
