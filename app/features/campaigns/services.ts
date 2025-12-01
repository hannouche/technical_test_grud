import { apiClient } from "@/lib/api-client";
import { Campaign, CampaignListFilters, GeneratedEmail } from "./types";
import { CampaignPayload } from "./validators";

const CAMPAIGN_PATH = "/campaigns";

export async function listCampaigns(filters?: CampaignListFilters): Promise<Campaign[]> {
  const params: Record<string, string> = {};

  if (filters?.status) {
    params.status = filters.status;
  }
  if (filters?.from) {
    params.from = filters.from;
  }
  if (filters?.to) {
    params.to = filters.to;
  }

  const { data } = await apiClient.get<Campaign[]>(CAMPAIGN_PATH, {
    params: Object.keys(params).length ? params : undefined,
  });

  if (filters?.search) {
    return data.filter((campaign) =>
      campaign.name.toLowerCase().includes(filters.search?.toLowerCase() ?? ""),
    );
  }

  return data;
}

export async function getCampaign(id: string): Promise<Campaign> {
  const { data } = await apiClient.get<Campaign>(`${CAMPAIGN_PATH}/${id}`);
  return data;
}

export async function createCampaign(payload: CampaignPayload) {
  const { data } = await apiClient.post<Campaign>(CAMPAIGN_PATH, payload);
  return data;
}

export async function updateCampaign(id: string, payload: CampaignPayload) {
  const { data } = await apiClient.patch<Campaign>(`${CAMPAIGN_PATH}/${id}`, payload);
  return data;
}

export async function triggerCampaign(id: string) {
  const { data } = await apiClient.post<{ message: string }>(`${CAMPAIGN_PATH}/${id}/trigger`);
  return data;
}

export async function pauseCampaign(id: string) {
  const { data } = await apiClient.patch<Campaign>(`${CAMPAIGN_PATH}/${id}/pause`);
  return data;
}

export async function resumeCampaign(id: string) {
  const { data } = await apiClient.patch<Campaign>(`${CAMPAIGN_PATH}/${id}/resume`);
  return data;
}

export async function cancelCampaign(id: string) {
  const { data } = await apiClient.patch<Campaign>(`${CAMPAIGN_PATH}/${id}/cancel`);
  return data;
}

export async function listGeneratedEmails(campaignId: string) {
  const { data } = await apiClient.get<GeneratedEmail[]>(`${CAMPAIGN_PATH}/${campaignId}/generated-emails`);
  return data;
}

export async function approveGeneratedEmail(campaignId: string, emailId: string) {
  const { data } = await apiClient.patch<GeneratedEmail>(
    `${CAMPAIGN_PATH}/${campaignId}/generated-emails/${emailId}/approve`,
  );
  return data;
}
