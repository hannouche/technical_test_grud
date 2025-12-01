"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CAMPAIGN_STATUS_BADGES } from "../constants";
import { CampaignStatus } from "../types";

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize font-medium", CAMPAIGN_STATUS_BADGES[status])}
    >
      {status.toLowerCase()}
    </Badge>
  );
}
