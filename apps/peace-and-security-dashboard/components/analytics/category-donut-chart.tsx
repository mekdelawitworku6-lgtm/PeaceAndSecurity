"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type TimeRange = "week" | "month" | "year";

const DATA_BY_RANGE: Record<TimeRange, { name: string; value: number; color: string }[]> = {
  week: [
    { name: "Robbery/Theft", value: 18, color: "#0d2d82" },
    { name: "Forgery/Fraud", value: 14, color: "#0ea5e9" },
    { name: "Street Begging", value: 12, color: "#f59e0b" },
    { name: "Illegal Weapons", value: 9, color: "#10b981" },
  ],
  month: [
    { name: "Robbery/Theft", value: 72, color: "#0d2d82" },
    { name: "Forgery/Fraud", value: 58, color: "#0ea5e9" },
    { name: "Street Begging", value: 52, color: "#f59e0b" },
    { name: "Illegal Weapons", value: 38, color: "#10b981" },
  ],
  year: [
    { name: "Robbery/Theft", value: 240, color: "#0d2d82" },
    { name: "Forgery/Fraud", value: 195, color: "#0ea5e9" },
    { name: "Street Begging", value: 175, color: "#f59e0b" },
    { name: "Illegal Weapons", value: 125, color: "#10b981" },
  ],
};

type Props = { timeRange: TimeRange };

export function CategoryDonutChart({ timeRange }: Props) {
  const data = DATA_BY_RANGE[timeRange];

  return (
    <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden max-w-md">
      <CardHeader className="border-b border-slate-50 px-6 py-4">
        <CardTitle className="text-sm font-bold text-[#0c2340]">Reports by Category</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="h-[180px] w-[180px] relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3.5">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2.5">
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
