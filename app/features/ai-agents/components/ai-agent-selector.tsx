"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { listAiModels } from "../services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AiAgentSelectorProps = {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function AiAgentSelector({ value, onChange, disabled }: AiAgentSelectorProps) {
  const { data: models = [], isLoading } = useQuery({
    queryKey: ["ai-models"],
    queryFn: listAiModels,
  });

  useEffect(() => {
    if (!value && models.length) {
      onChange(models[0]!.id);
    }
  }, [models, onChange, value]);

  const placeholder = isLoading ? (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading models...
    </div>
  ) : (
    <SelectValue placeholder="Select model" />
  );

  return (
    <Select value={value ?? ""} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger className="w-full">{placeholder}</SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex flex-col">
              <span className="font-medium">{model.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
