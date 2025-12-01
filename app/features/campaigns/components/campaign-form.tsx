"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { WEEKLY_DAYS } from "@/constant/data";
import { getBrowserTimezone } from "@/lib/timezones";
import { cn } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multi-select";
import { CampaignPayload, CampaignFormSchema, CampaignFormValues } from "../validators";
import { Campaign } from "../types";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import TimezoneSelect from "./timezone-select-wrapper";
import { AiAgentSelector } from "@/features/ai-agents/components/ai-agent-selector";

type CampaignFormProps = {
  mode: "create" | "edit";
  campaign?: Campaign;
  onSubmit: (payload: CampaignPayload) => Promise<void>;
  isSubmitting?: boolean;
};

const steps = [
  { id: 1, title: "Basic Information" },
  { id: 2, title: "Schedule Configuration" },
  { id: 3, title: "Duration & Timing" },
  { id: 4, title: "Review & Confirm" },
];

const STEP_FIELDS: Record<number, (keyof CampaignFormValues)[]> = {
  0: ["name", "model", "context"],
  1: ["scheduleType", "dailyEmails", "weeklyDays", "weeklyEmailsPerDay"],
  2: ["durationDays", "startDateUtc", "timezone"],
  3: [],
};

export function CampaignForm({ mode, campaign, onSubmit, isSubmitting }: CampaignFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const getDefaults = (): CampaignFormValues => {
    if (campaign) {
      return {
        name: campaign.name,
        model: campaign.model,
        context: campaign.context,
        scheduleType: campaign.scheduleType,
        dailyEmails: campaign.dailyEmails ?? undefined,
        weeklyDays: campaign.weeklyDays ?? [],
        weeklyEmailsPerDay: campaign.weeklyEmailsPerDay ?? undefined,
        durationDays: campaign.durationDays,
        startDateUtc: new Date(campaign.startDateUtc),
        timezone: campaign.timezone,
        status: campaign.status === "DRAFT" ? "DRAFT" : "ACTIVE",
      };
    }

    return {
      name: "",
      model: "",
      context: "",
      scheduleType: "DAILY",
      dailyEmails: 2,
      weeklyDays: [],
      weeklyEmailsPerDay: 5,
      durationDays: 7,
      startDateUtc: new Date(Date.now() + 60 * 60 * 1000),
      timezone: getBrowserTimezone(),
      status: "ACTIVE",
    };
  };

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(CampaignFormSchema) as any,
    defaultValues: getDefaults(),
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(getDefaults());
    setCurrentStep(0);
  }, [campaign, form]);

  const scheduleType = form.watch("scheduleType");

  const handleNext = async () => {
    let fieldsToValidate: (keyof CampaignFormValues)[] = [];
    
    if (currentStep !== 1) {
      fieldsToValidate = STEP_FIELDS[currentStep] ?? [];
    } else {
      if (scheduleType === "WEEKLY") {
        fieldsToValidate = ["scheduleType", "weeklyDays", "weeklyEmailsPerDay"];
      } else {
        fieldsToValidate = ["scheduleType", "dailyEmails"];
      }
    }

    const isValid = await form.trigger(fieldsToValidate as any);
    if (!isValid) return;
    
    const nextStep = currentStep + 1;
    if (nextStep < steps.length) {
      setCurrentStep(nextStep);
    }
  };

  const handlePrev = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
    }
  };

  const handleFormSubmit = async (values: CampaignFormValues, statusOverride?: "DRAFT" | "ACTIVE") => {
    try {
      let payload: CampaignPayload;
      if (values.scheduleType === "DAILY") {
        payload = {
          name: values.name,
          model: values.model,
          context: values.context,
          scheduleType: values.scheduleType,
          dailyEmails: values.dailyEmails ?? 1,
          weeklyDays: [],
          weeklyEmailsPerDay: undefined,
          durationDays: values.durationDays,
          startDateUtc: values.startDateUtc.toISOString(),
          timeZone: values.timezone,
          status: statusOverride ?? values.status ?? "ACTIVE",
        };
      } else {
        payload = {
          name: values.name,
          model: values.model,
          context: values.context,
          scheduleType: values.scheduleType,
          dailyEmails: undefined,
          weeklyDays: values.weeklyDays ?? [],
          weeklyEmailsPerDay: values.weeklyEmailsPerDay ?? 1,
          durationDays: values.durationDays,
          startDateUtc: values.startDateUtc.toISOString(),
          timeZone: values.timezone,
          status: statusOverride ?? values.status ?? "ACTIVE",
        };
      }

      await onSubmit(payload);
    } catch (error) {
      console.error("Form submission error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit campaign. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleFinalSubmit = form.handleSubmit(
    async (values: CampaignFormValues) => {
      await handleFormSubmit(values);
    },
    (errors) => {
      const allFields: (keyof CampaignFormValues)[] = [
        "name", "model", "context",
        "scheduleType", "dailyEmails", "weeklyDays", "weeklyEmailsPerDay",
        "durationDays", "startDateUtc", "timezone"
      ];
      
      for (const field of allFields) {
        if (errors[field]) {
          for (let step = 0; step < steps.length - 1; step++) {
            if (STEP_FIELDS[step] && STEP_FIELDS[step].includes(field)) {
              setCurrentStep(step);
              break;
            }
          }
          break;
        }
      }
      toast.error("Please fix all validation errors before submitting.");
    }
  );

  const handleDraftSubmit = form.handleSubmit(
    async (values: CampaignFormValues) => {
      await handleFormSubmit(values, "DRAFT");
    },
    (errors) => {
      const requiredFields: (keyof CampaignFormValues)[] = ["name", "model", "context"];
      let hasRequiredErrors = false;
      for (const field of requiredFields) {
        if (errors[field]) {
          hasRequiredErrors = true;
          break;
        }
      }
      if (hasRequiredErrors) {
        setCurrentStep(0);
        toast.error("Please fill in the required basic information.");
      } else {
        toast.error("Please fix validation errors before saving as draft.");
      }
    }
  );

  const isReviewStep = currentStep === steps.length - 1;

  return (
    <div className="space-y-6">
      <StepIndicator currentStep={currentStep} />
      <Form {...form}>
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-4 rounded-xl border p-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign name</FormLabel>
                    <FormControl>
                      <Input placeholder="Spring launch outreach" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI model</FormLabel>
                    <FormControl>
                      <AiAgentSelector value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign context</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Product details, ideal customer profile, tone, key value props"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mode === "edit" && campaign?.status === "DRAFT" && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel>Publish immediately</FormLabel>
                        <FormDescription>
                          Keep campaign as draft or activate after saving.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === "ACTIVE"}
                          onCheckedChange={(checked) => field.onChange(checked ? "ACTIVE" : "DRAFT")}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4 rounded-xl border p-4">
              <FormField
                control={form.control}
                name="scheduleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid gap-4 md:grid-cols-2"
                      >
                        <ScheduleCard
                          value="DAILY"
                          title="Daily"
                        />
                        <ScheduleCard
                          value="WEEKLY"
                          title="Weekly"
                        />
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {scheduleType === "DAILY" && (
                <FormField
                  control={form.control}
                  name="dailyEmails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emails per day</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          {...field}
                          value={field.value?.toString() ?? ""}
                          onChange={(event) =>
                            field.onChange(event.target.value ? Number(event.target.value) : undefined)
                          }
                        />
                      </FormControl>
                      <FormDescription>How many leads should the campaign email per day?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {scheduleType === "WEEKLY" && (
                <>
                  <FormField
                    control={form.control}
                    name="weeklyDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select days</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={WEEKLY_DAYS.map((day) => ({
                              value: day.value.toString(),
                              label: day.label,
                            }))}
                            value={(field.value ?? []).map((value) => value.toString())}
                            onChange={(values) =>
                              field.onChange(values.map((value) => Number(value)))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weeklyEmailsPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emails per selected day</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            {...field}
                            value={field.value?.toString() ?? ""}
                            onChange={(event) =>
                              field.onChange(event.target.value ? Number(event.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormDescription>How many emails should go out on each selected day?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 rounded-xl border p-4">
              <FormField
                control={form.control}
                name="durationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign duration (days)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={3650}
                        {...field}
                        value={field.value?.toString() ?? ""}
                        onChange={(event) =>
                          field.onChange(event.target.value ? Number(event.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Leads will receive emails for this many days after enrollment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDateUtc"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start date (UTC)</FormLabel>
                    <div className="flex flex-col gap-2 md:flex-row">
                      <div className="flex-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : <span>Select date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => date && field.onChange(date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex-1">
                        <Input
                          type="time"
                          value={format(field.value ?? new Date(), "HH:mm")}
                          onChange={(event) => {
                            const [hour, minute] = event.target.value.split(":").map(Number);
                            const updated = new Date(field.value ?? new Date());
                            updated.setHours(hour);
                            updated.setMinutes(minute);
                            field.onChange(updated);
                          }}
                        />
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <TimezoneSelect
                        value={field.value}
                        onChange={(value) =>
                          field.onChange(typeof value === "string" ? value : value.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {isReviewStep && (
            <div className="space-y-4 rounded-xl border p-4">
              <ReviewSection title="Basics">
                <ReviewRow label="Name" value={form.watch("name")} />
                <ReviewRow label="Model" value={form.watch("model") || "Not selected"} />
                <ReviewRow label="Context" value={form.watch("context")} />
              </ReviewSection>
              <ReviewSection title="Schedule">
                <ReviewRow label="Type" value={form.watch("scheduleType")} />
                {form.watch("scheduleType") === "DAILY" ? (
                  <ReviewRow label="Daily emails" value={`${form.watch("dailyEmails")} emails`} />
                ) : (
                  <>
                    <ReviewRow
                      label="Days"
                      value={(form.watch("weeklyDays") ?? [])
                        .map((day) => WEEKLY_DAYS.find((d) => d.value === day)?.label)
                        .filter(Boolean)
                        .join(", ")}
                    />
                    <ReviewRow
                      label="Emails per day"
                      value={`${form.watch("weeklyEmailsPerDay")} emails`}
                    />
                  </>
                )}
              </ReviewSection>
              <ReviewSection title="Timing">
                <ReviewRow label="Duration" value={`${form.watch("durationDays")} days`} />
                <ReviewRow
                  label="Start"
                  value={
                    form.watch("startDateUtc")
                      ? `${format(form.watch("startDateUtc"), "PPP hh:mm a")} (${form.watch("timezone")})`
                      : undefined
                  }
                />
              </ReviewSection>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handlePrev} disabled={currentStep === 0}>
                Back
              </Button>
              {currentStep < steps.length - 1 && (
                <Button type="button" onClick={handleNext}>
                  Continue
                </Button>
              )}
            </div>

            {isReviewStep && (
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleDraftSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save as draft"}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : mode === "create" ? "Create campaign" : "Update campaign"}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex flex-col gap-2 md:flex-row">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={cn(
            "flex-1 rounded-lg border p-3",
            index === currentStep && "border-primary bg-primary/5",
            index < currentStep && "border-emerald-500 bg-emerald-500/5",
          )}
        >
          <p className="text-xs uppercase text-muted-foreground">Step {step.id}</p>
          <p className="font-medium">{step.title}</p>
        </li>
      ))}
    </ol>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-muted-foreground">{title}</p>
      <div className="mt-2 space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between rounded-md border p-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}

function ScheduleCard({
  value,
  title,
}: {
  value: "DAILY" | "WEEKLY";
  title: string;
}) {
  const id = `schedule-${value}`;
  return (
    <div>
      <RadioGroupItem id={id} value={value} className="peer sr-only" />
      <Label
        htmlFor={id}
        className="flex cursor-pointer flex-col rounded-lg border p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
      >
        <span className="font-medium">{title}</span>
      </Label>
    </div>
  );
}
