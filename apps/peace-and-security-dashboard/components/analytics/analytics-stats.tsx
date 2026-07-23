"use client";

import { Card, CardContent } from "@/components/ui/card";

type TimeRange = "week" | "month" | "year";

interface Stats {
  totalReports: number;
  highPriorityReports: number;
  avgResponseTime: string;
  topLocation: string;
}

type Props = { timeRange: TimeRange; stats?: Stats };

export function AnalyticsStats({ timeRange, stats }: Props) {
  const data = stats
    ? [
        { label: "Total Reports", value: String(stats.totalReports) },
        { label: "High Priority Reports", value: String(stats.highPriorityReports) },
        { label: "Avg. Response Time", value: stats.avgResponseTime },
        { label: "Top Location", value: stats.topLocation },
      ]
    : [
        { label: "Total Reports", value: "0" },
        { label: "High Priority Reports", value: "0" },
        { label: "Avg. Response Time", value: "N/A" },
        { label: "Top Location", value: "N/A" },
      ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((item, index) => (
        <Card key={index} className="border border-slate-100 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {item.label}
            </span>
            <div className="text-3xl font-black text-[#0c2340] tracking-tight mt-4">
              {item.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
