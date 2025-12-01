import { CampaignStatus } from "./types";

export const CAMPAIGN_STATUS_BADGES: Record<CampaignStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200",
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  PAUSED: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
};

export const CAMPAIGN_STATUS_ACTIONS: Record<
  CampaignStatus,
  { canPause: boolean; canResume: boolean; canCancel: boolean }
> = {
  DRAFT: { canPause: false, canResume: false, canCancel: false },
  ACTIVE: { canPause: true, canResume: false, canCancel: true },
  PAUSED: { canPause: false, canResume: true, canCancel: true },
  COMPLETED: { canPause: false, canResume: false, canCancel: false },
  CANCELLED: { canPause: false, canResume: false, canCancel: false },
};

export const CAMPAIGN_STATUS_ORDER: CampaignStatus[] = [
  "ACTIVE",
  "PAUSED",
  "DRAFT",
  "COMPLETED",
  "CANCELLED",
];

export const STATUS_FILTER_OPTIONS: { value: CampaignStatus | "ALL"; label: string }[] =
  [
    { value: "ALL", label: "All statuses" },
    { value: "DRAFT", label: "Draft" },
    { value: "ACTIVE", label: "Active" },
    { value: "PAUSED", label: "Paused" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];
