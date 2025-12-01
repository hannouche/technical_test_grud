export type ScheduleType = "DAILY" | "WEEKLY";

export type CampaignStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED";

export type Campaign = {
  id: string;
  name: string;
  model: string;
  context: string;
  scheduleType: ScheduleType;
  dailyEmails?: number | null;
  weeklyDays: number[];
  weeklyEmailsPerDay?: number | null;
  durationDays: number;
  startDateUtc: string;
  timezone: string;
  timeZone?: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  generatedEmailsCount?: number;
  leadsCount?: number;
};

export type GeneratedEmail = {
  id: string;
  campaignId: string;
  scheduledSlot: number;
  subject: string;
  bodyHtml: string;
  createdAt: string;
  approved: boolean;
};

export type CampaignListFilters = {
  status?: CampaignStatus;
  from?: string;
  to?: string;
  search?: string;
};

export type CampaignStatusAction = "pause" | "resume" | "cancel";

export type CampaignFiltersState = {
  status: CampaignStatus | "ALL";
  search: string;
  from?: Date;
  to?: Date;
  sortBy: "name" | "status" | "startDateUtc" | "createdAt";
  sortDirection: "asc" | "desc";
};
