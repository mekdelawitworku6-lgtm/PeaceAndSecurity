"use client";

import { Card, CardContent } from "@/components/ui/card";

type TimeRange = "week" | "month" | "year";

interface StatItem {
  label: string;
  value: string;
}

const STATS_BY_RANGE: Record<TimeRange, StatItem[]> = {
  week: [
    { label: "Total Reports", value: "87" },
    { label: "High Priority Reports", value: "14" },
    { label: "Avg. Response Time", value: "12 min" },
    { label: "Top Location", value: "Bole Sub-City" },
  ],
  month: [
    { label: "Total Reports", value: "312" },
    { label: "High Priority Reports", value: "68" },
    { label: "Avg. Response Time", value: "18 min" },
    { label: "Top Location", value: "Bole Sub-City" },
  ],
  year: [
    { label: "Total Reports", value: "3,847" },
    { label: "High Priority Reports", value: "812" },
    { label: "Avg. Response Time", value: "22 min" },
    { label: "Top Location", value: "Arada Sub-City" },
  ],
};

type Props = { timeRange: TimeRange };

export function AnalyticsStats({ timeRange }: Props) {
  const data = STATS_BY_RANGE[timeRange];

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
