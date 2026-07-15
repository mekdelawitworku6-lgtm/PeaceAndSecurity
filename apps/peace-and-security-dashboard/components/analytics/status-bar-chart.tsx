"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type TimeRange = "week" | "month" | "year";

const DATA_BY_RANGE: Record<TimeRange, { name: string; count: number }[]> = {
  week: [
    { name: "Mon", count: 34 },
    { name: "Tue", count: 39 },
    { name: "Wed", count: 36 },
    { name: "Thu", count: 41 },
    { name: "Fri", count: 50 },
    { name: "Sat", count: 48 },
    { name: "Sun", count: 31 },
  ],
  month: [
    { name: "Week 1", count: 78 },
    { name: "Week 2", count: 92 },
    { name: "Week 3", count: 85 },
    { name: "Week 4", count: 87 },
  ],
  year: [
    { name: "Jan", count: 340 },
    { name: "Feb", count: 390 },
    { name: "Mar", count: 360 },
    { name: "Apr", count: 410 },
    { name: "May", count: 500 },
    { name: "Jun", count: 480 },
    { name: "Jul", count: 520 },
    { name: "Aug", count: 470 },
    { name: "Sep", count: 430 },
    { name: "Oct", count: 490 },
    { name: "Nov", count: 530 },
    { name: "Dec", count: 510 },
  ],
};

type Props = { timeRange: TimeRange };

export function StatusBarChart({ timeRange }: Props) {
  const data = DATA_BY_RANGE[timeRange];

  return (
    <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-50 px-6 py-4">
        <CardTitle className="text-sm font-bold text-[#0c2340]">Reports by Status Over Time</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -20, bottom: 0 }}>
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
