import { apiClient } from "@/lib/api-client";
import { CreateLeadPayload, Lead } from "./types";

const LEADS_PATH = "/leads";

export async function listLeads() {
  const { data } = await apiClient.get<Lead[]>(LEADS_PATH);
  return data;
}

export async function createLead(payload: CreateLeadPayload) {
  const { data } = await apiClient.post<{ leads: Lead[] }>(`${LEADS_PATH}/create`, payload);
  return data;
}
