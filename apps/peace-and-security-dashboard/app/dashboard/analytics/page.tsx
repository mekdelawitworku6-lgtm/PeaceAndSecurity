"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { PERMISSIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";

// Import modular analytics components
import { AnalyticsStats } from "@/components/analytics/analytics-stats";
import { StatusBarChart } from "@/components/analytics/status-bar-chart";
import { MonthlyLineChart } from "@/components/analytics/monthly-line-chart";
import { CategoryDonutChart } from "@/components/analytics/category-donut-chart";

type TimeRange = "week" | "month" | "year";

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  if (!hasPermission(PERMISSIONS.DASHBOARD_VIEW)) {
    router.replace("/dashboard/reports");
    return null;
  }

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0c2340] tracking-tight">Analytics</h1>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
          {/* Time range tab selectors */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            {(["week", "month", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap capitalize",
                  timeRange === range
                    ? "bg-[#0d2d82] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {range === "week" ? "This Week" : range === "month" ? "This Month" : "This Year"}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-600 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            Export
          </button>
        </div>
      </div>

      {/* 4 Stat Cards — data changes with timeRange */}
      <AnalyticsStats timeRange={timeRange} />

      {/* Two main trends charts side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusBarChart timeRange={timeRange} />
        <MonthlyLineChart timeRange={timeRange} />
      </div>

      {/* Donut chart at the bottom */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryDonutChart timeRange={timeRange} />
      </div>
    </div>
  );
}
