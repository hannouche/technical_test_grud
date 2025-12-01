import { z } from "zod";

export const LeadFormSchema = z.object({
  emails: z
    .string()
    .min(1, "Email is required")
    .refine((value) => {
      const entries = value
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean);

      if (entries.length === 0) return false;

      return entries.every((email) => z.string().email().safeParse(email).success);
    }, "Enter at least one valid email (separate with commas)"),
  campaignId: z
    .string()
    .min(1, "Campaign is required")
    .uuid("Campaign ID must be a valid UUID"),
});

export type LeadFormValues = z.infer<typeof LeadFormSchema>;
