"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

const FormSchema = z.object({
  dob: z.date({
    error: "A date of birth is required.",
  }),
});

type DatePickerDayProps = {
  placeholder: string;
  label?: string;
  value?: Date | string;
  required?: boolean;
  onChange?: (value: Date) => void;
};

export function DatePickerDay({ placeholder, label, value, required, onChange }: DatePickerDayProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast.success(`Selected date of birth: ${format(data.dob, "PPP")}`);
    onChange?.(data.dob);
  }

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    form.setValue("dob", date);
    onChange?.(date);
  };

  useEffect(() => {
    const externalValue = value;
    if (!externalValue) return;
    let parsed: Date | null = null;
    if (externalValue instanceof Date) parsed = externalValue;
    else {
      const d = new Date(externalValue);
      parsed = isNaN(d.getTime()) ? null : d;
    }
    if (parsed && form.getValues("dob")?.toString() !== parsed.toString()) {
      form.setValue("dob", parsed);
    }
  }, [value, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{label}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>{placeholder}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={handleDateChange}
                    // disabled={(date) =>
                    //   date > new Date() || date < new Date("1900-01-01")
                    // }
                    required={required}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
