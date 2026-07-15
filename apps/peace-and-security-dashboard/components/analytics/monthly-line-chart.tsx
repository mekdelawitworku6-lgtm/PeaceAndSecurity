"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type TimeRange = "week" | "month" | "year";

const DATA_BY_RANGE: Record<TimeRange, { name: string; count: number }[]> = {
  week: [
    { name: "Mon", count: 15 },
    { name: "Tue", count: 8 },
    { name: "Wed", count: 12 },
    { name: "Thu", count: 7 },
    { name: "Fri", count: 18 },
    { name: "Sat", count: 22 },
    { name: "Sun", count: 5 },
  ],
  month: [
    { name: "Week 1", count: 78 },
    { name: "Week 2", count: 92 },
    { name: "Week 3", count: 85 },
    { name: "Week 4", count: 87 },
  ],
  year: [
    { name: "Jun", count: 95 },
    { name: "Jul", count: 180 },
    { name: "Aug", count: 140 },
    { name: "Sep", count: 160 },
    { name: "Oct", count: 250 },
    { name: "Nov", count: 380 },
    { name: "Dec", count: 320 },
  ],
};

type Props = { timeRange: TimeRange };

export function MonthlyLineChart({ timeRange }: Props) {
  const data = DATA_BY_RANGE[timeRange];

  return (
    <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-50 px-6 py-4">
        <CardTitle className="text-sm font-bold text-[#0c2340]">Report Over Time</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -20, bottom: 0 }}>
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
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0d2d82"
                strokeWidth={2}
                dot={{ fill: '#0d2d82', r: 5, stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
