"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lead } from "../types";
import { Loader2 } from "lucide-react";
import { DateTime } from "luxon";

type LeadTableProps = {
  leads: Lead[];
  campaignLookup: Record<string, string>;
  isLoading?: boolean;
};

export function LeadTable({ leads, campaignLookup, isLoading }: LeadTableProps) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>First name</TableHead>
            <TableHead>Last name</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Created at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading leads...
                </div>
              </TableCell>
            </TableRow>
          ) : leads.length ? (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.email}</TableCell>
                <TableCell>{lead.firstName ?? "—"}</TableCell>
                <TableCell>{lead.lastName ?? "—"}</TableCell>
                <TableCell>{campaignLookup[lead.campaignId] ?? lead.campaignId}</TableCell>
                <TableCell>
                  {DateTime.fromISO(lead.createdAt).toFormat("MMM dd, yyyy hh:mm a")}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No leads match the current filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
