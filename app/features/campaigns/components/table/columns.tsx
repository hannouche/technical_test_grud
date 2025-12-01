"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WEEKLY_DAYS } from "@/constant/data";
import { Campaign } from "@/features/campaigns/types";
import { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import { EllipsisVertical, Eye, Pause, Play, X } from "lucide-react";
import { CampaignStatusBadge } from "../campaign-status-badge";
import { CAMPAIGN_STATUS_ACTIONS } from "../../constants";

const formatSchedule = (campaign: Campaign) => {
  if (campaign.scheduleType === "DAILY") {
    return `${campaign.dailyEmails ?? 0} emails / day`;
  }

  const dayLabels = campaign.weeklyDays
    .map((day) => WEEKLY_DAYS.find((d) => d.value === day)?.label)
    .filter(Boolean)
    .join(", ");

  return `${dayLabels || "—"} · ${campaign.weeklyEmailsPerDay ?? 0} emails / day`;
};

const formatStartDate = (date: string, timezone: string) => {
  return DateTime.fromISO(date, { zone: "utc" })
    .setZone(timezone || "utc")
    .toFormat("MMM dd, yyyy • hh:mm a ZZZZ");
};

export const getCampaignColumns = (
  handlers: {
    onView: (campaign: Campaign) => void;
    onPause: (campaign: Campaign) => void;
    onResume: (campaign: Campaign) => void;
    onCancel: (campaign: Campaign) => void;
  },
): ColumnDef<Campaign>[] => [
  {
    accessorKey: "name",
    header: "Campaign",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">
          Model: {row.original.model || "Unassigned"}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <CampaignStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "scheduleType",
    header: "Schedule",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="capitalize font-medium">{row.original.scheduleType.toLowerCase()}</p>
        <p className="text-xs text-muted-foreground">{formatSchedule(row.original)}</p>
      </div>
    ),
  },
  {
    accessorKey: "startDateUtc",
    header: "Start Date",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-medium">
          {formatStartDate(row.original.startDateUtc, row.original.timezone)}
        </p>
        <p className="text-xs text-muted-foreground">{row.original.timezone}</p>
      </div>
    ),
  },
  {
    accessorKey: "durationDays",
    header: "Duration",
    cell: ({ row }) => (
      <div className="space-y-1">
        <p className="font-medium">{row.original.durationDays} days</p>
        <p className="text-xs text-muted-foreground">
          Leads: {row.original.leadsCount ?? 0} · Emails: {row.original.generatedEmailsCount ?? 0}
        </p>
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => {
      const campaign = row.original;
      const statusActions = CAMPAIGN_STATUS_ACTIONS[campaign.status];

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open actions">
              <EllipsisVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer" onClick={() => handlers.onView(campaign)}>
              <Eye className="w-4 h-4 mr-2" /> View details
            </DropdownMenuItem>
            {statusActions.canPause && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handlers.onPause(campaign)}
                >
                  <Pause className="w-4 h-4 mr-2" /> Pause
                </DropdownMenuItem>
              </>
            )}
            {statusActions.canResume && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handlers.onResume(campaign)}
              >
                <Play className="w-4 h-4 mr-2" /> Resume
              </DropdownMenuItem>
            )}
            {statusActions.canCancel && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => handlers.onCancel(campaign)}
                >
                  <X className="w-4 h-4 mr-2" /> Cancel
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
