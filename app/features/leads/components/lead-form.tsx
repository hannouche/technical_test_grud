"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Campaign } from "@/features/campaigns/types";
import { LeadFormSchema, LeadFormValues } from "../validators";

type LeadFormProps = {
  campaigns: Campaign[];
  defaultCampaignId?: string;
  onSubmit: (values: LeadFormValues) => Promise<void>;
  isSubmitting?: boolean;
};

export function LeadForm({
  campaigns,
  defaultCampaignId,
  onSubmit,
  isSubmitting,
}: LeadFormProps) {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(LeadFormSchema),
    defaultValues: {
      emails: "",
      campaignId: defaultCampaignId ?? "",
    },
  });

  useEffect(() => {
    if (defaultCampaignId) {
      form.setValue("campaignId", defaultCampaignId);
    }
  }, [defaultCampaignId, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    form.reset({ emails: "", campaignId: defaultCampaignId ?? "" });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="emails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead email</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="lead@company.com, founder@startup.com"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter one or more emails separated by commas to enroll multiple leads at once.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="campaignId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Campaign</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={Boolean(defaultCampaignId)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add lead"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
