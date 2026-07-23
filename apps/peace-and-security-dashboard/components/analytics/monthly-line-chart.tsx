"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type TimeRange = "week" | "month" | "year";

type Props = {
  timeRange: TimeRange;
  data?: { period: string; count: string }[];
};

export function MonthlyLineChart({ timeRange, data = [] }: Props) {
  const chartData = data.map((d) => ({
    name: d.period,
    count: Number(d.count),
  }));

  return (
    <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-50 px-6 py-4">
        <CardTitle className="text-sm font-bold text-[#0c2340]">Report Over Time</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ left: -20, bottom: 0 }}>
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
