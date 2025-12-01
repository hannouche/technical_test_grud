import { apiClient } from "@/lib/api-client";
import { AiModel } from "./types";

const AI_BASE_PATH = "/ai";

export async function listAiModels(): Promise<AiModel[]> {
  const { data } = await apiClient.get<AiModel[]>(`${AI_BASE_PATH}/models`);
  return data;
}
