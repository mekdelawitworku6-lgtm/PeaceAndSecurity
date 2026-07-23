"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type TimeRange = "week" | "month" | "year";

const COLORS = ["#0d2d82", "#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#6b7280", "#ec4899"];

type Props = {
  timeRange: TimeRange;
  data?: { name: string; value: string }[];
};

export function CategoryDonutChart({ timeRange, data = [] }: Props) {
  const chartData = data.map((d) => ({
    name: d.name,
    value: Number(d.value),
  }));

  return (
    <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden max-w-md">
      <CardHeader className="border-b border-slate-50 px-6 py-4">
        <CardTitle className="text-sm font-bold text-[#0c2340]">Reports by Category</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
        {chartData.length > 0 ? (
          <>
            <div className="h-[180px] w-[180px] relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3.5">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">No category data available</p>
        )}
      </CardContent>
    </Card>
  );
}
