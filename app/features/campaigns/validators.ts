import { z } from "zod";
import { ScheduleType } from "./types";

const numberInRange = (min: number, max: number, label: string) =>
  z.coerce
    .number()
    .int(`${label} must be a number`)
    .min(min, `Minimum value is ${min}`)
    .max(max, `Maximum value is ${max}`)
    .optional();

export const CampaignFormSchema = z
  .object({
    name: z.string().min(2, "Campaign name must be at least 2 characters"),
    model: z.string().min(1, "Model is required"),
    context: z.string().min(5, "Context must be at least 5 characters"),
    scheduleType: z.enum(["DAILY", "WEEKLY"]),
    dailyEmails: numberInRange(1, 100, "Daily emails"),
    weeklyDays: z.array(z.number().int().min(0).max(6)).optional().default([]),
    weeklyEmailsPerDay: numberInRange(1, 100, "Weekly emails per day"),
    durationDays: z.coerce
      .number()
      .int("Campaign duration must be a number")
      .min(1, "Campaign duration must be at least 1 day")
      .max(3650, "Campaign duration cannot exceed 10 years"),
    startDateUtc: z.date(),
    timezone: z.string().min(1, "Timezone is required"),
    status: z.enum(["DRAFT", "ACTIVE"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.scheduleType === "DAILY" && data.dailyEmails == null) {
      ctx.addIssue({ path: ["dailyEmails"], code: z.ZodIssueCode.custom, message: "Set a daily email count" });
    }

    if (data.scheduleType === "WEEKLY") {
      if (!data.weeklyDays || data.weeklyDays.length === 0) {
        ctx.addIssue({ path: ["weeklyDays"], code: z.ZodIssueCode.custom, message: "Pick at least one weekday" });
      }
      if (data.weeklyEmailsPerDay == null) {
        ctx.addIssue({ path: ["weeklyEmailsPerDay"], code: z.ZodIssueCode.custom, message: "Set emails per selected day" });
      }
    }

    if (data.startDateUtc < new Date()) {
      ctx.addIssue({ path: ["startDateUtc"], code: z.ZodIssueCode.custom, message: "Start date must be in the future" });
    }
  });

export type CampaignFormValues = z.infer<typeof CampaignFormSchema>;

export type CampaignPayload = {
  name: string;
  model: string;
  context: string;
  scheduleType: ScheduleType;
  dailyEmails?: number | null;
  weeklyDays: number[];
  weeklyEmailsPerDay?: number | null;
  durationDays: number;
  startDateUtc: string;
  timeZone: string;
  status?: "DRAFT" | "ACTIVE";
};
