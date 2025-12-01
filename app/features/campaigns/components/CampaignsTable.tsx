"use client";

import { Campaign } from "../types";

export function CampaignStatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      PAUSED: "bg-yellow-100 text-yellow-700",
      CANCELLED: "bg-red-100 text-red-700",
      DRAFT: "bg-gray-100 text-gray-700",
      COMPLETED: "bg-blue-100 text-blue-700",
    };
  
    return (
      <span className={`px-2 py-1 rounded text-xs ${colors[status] || ""}`}>
        {status}
      </span>
    );
  }

export default function CampaignsTable({ data }: { data: Campaign[] }) {
  console.log("data", data);
  return (
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-50 border-b">
          <th className="p-3">Name</th>
          <th className="p-3">Schedule</th>
          <th className="p-3">Status</th>
          <th className="p-3">Start</th>
        </tr>
      </thead>

      <tbody>
        {data.map(c => (
          <tr key={c.id} className="border-b hover:bg-gray-50">
            <td className="p-3">{c.name}</td>
            <td className="p-3">{c.scheduleType}</td>
            <td className="p-3"><CampaignStatusBadge status={c.status} /></td>
            <td className="p-3">
              {new Date(c.startDateUtc).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
