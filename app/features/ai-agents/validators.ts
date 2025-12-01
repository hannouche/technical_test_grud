import { z } from "zod";

export const AiAgentFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Agent name must have at least 2 characters" }),
  model: z.string()
    .min(1, "Select a base model"),
  description: z
    .string()
    .max(280, { message: "Description must be 280 characters or less" })
    .optional()
    .or(z.literal("")),
});

export type AiAgentFormValues = z.infer<typeof AiAgentFormSchema>;
