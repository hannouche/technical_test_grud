export type Lead = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  campaignId: string;
  createdAt: string;
  campaign?: {
    id: string;
    name: string;
  };
};

export type LeadFiltersState = {
  search: string;
  campaignId?: string;
};

export type CreateLeadPayload = {
  emails: string;
  campaignId: string;
};
