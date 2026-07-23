"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type TimeRange = "week" | "month" | "year";

type Props = {
  timeRange: TimeRange;
  data?: { period: string; status: string; count: string }[];
};

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "#f59e0b",
  UNDER_REVIEW: "#0ea5e9",
  ASSIGNED: "#8b5cf6",
  IN_PROGRESS: "#0d2d82",
  RESOLVED: "#10b981",
  CLOSED: "#6b7280",
};

export function StatusBarChart({ timeRange, data = [] }: Props) {
  // Group by period and aggregate counts
  const periodMap = new Map<string, number>();
  data.forEach((d) => {
    const current = periodMap.get(d.period) || 0;
    periodMap.set(d.period, current + Number(d.count));
  });

  const chartData = Array.from(periodMap.entries()).map(([period, count]) => ({
    name: period,
    count,
  }));

  return (
    <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-50 px-6 py-4">
        <CardTitle className="text-sm font-bold text-[#0c2340]">Reports by Status Over Time</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar
                dataKey="count"
                fill="#0d2d82"
                radius={[4, 4, 0, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
