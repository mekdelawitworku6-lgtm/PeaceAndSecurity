"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { Download, FileText, FileDown, ChevronDown } from "lucide-react";
import { PERMISSIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { analyticsService, AnalyticsData } from "@/lib/services/analytics-service";
import { toast } from "sonner";

import { AnalyticsStats } from "@/components/analytics/analytics-stats";
import { StatusBarChart } from "@/components/analytics/status-bar-chart";
import { MonthlyLineChart } from "@/components/analytics/monthly-line-chart";
import { CategoryDonutChart } from "@/components/analytics/category-donut-chart";

type TimeRange = "week" | "month" | "year";

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  if (!hasPermission(PERMISSIONS.DASHBOARD_VIEW)) {
    router.replace("/dashboard/reports");
    return null;
  }

  useEffect(() => {
    setLoading(true);
    analyticsService.getAnalytics(timeRange)
      .then((res) => setAnalyticsData(res.data))
      .catch(() => setAnalyticsData(null))
      .finally(() => setLoading(false));
  }, [timeRange]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleExportPdf = () => {
    setExportOpen(false);
    window.print();
  };

  const handleExportCsv = () => {
    setExportOpen(false);
    if (!analyticsData) return;
    const rows: string[] = ["Metric,Value"];
    const s = analyticsData.stats;
    rows.push(`Total Reports,${s.totalReports}`);
    rows.push(`High Priority Reports,${s.highPriorityReports}`);
    rows.push(`Avg Response Time,${s.avgResponseTime}`);
    rows.push(`Top Location,${s.topLocation}`);
    if (analyticsData.statusChart?.length) {
      rows.push("");
      rows.push("Period,Status,Count");
      for (const item of analyticsData.statusChart) {
        rows.push(`${item.period || ""},${item.status || ""},${item.count || 0}`);
      }
    }
    if (analyticsData.categoryChart?.length) {
      rows.push("");
      rows.push("Category,Count");
      for (const item of analyticsData.categoryChart) {
        rows.push(`${item.name || ""},${item.value || 0}`);
      }
    }
    if (analyticsData.trendChart?.length) {
      rows.push("");
      rows.push("Period,Count");
      for (const item of analyticsData.trendChart) {
        rows.push(`${item.period || ""},${item.count || 0}`);
      }
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${timeRange}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0c2340] tracking-tight">Analytics</h1>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-auto">
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

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-600 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              Export
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", exportOpen && "rotate-180")} />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                  onClick={handleExportCsv}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FileText className="w-4 h-4 text-green-500" />
                  Export as CSV
                </button>
                <button
                  onClick={handleExportPdf}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
                >
                  <FileDown className="w-4 h-4 text-red-500" />
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading analytics...</div>
      ) : analyticsData ? (
        <>
          <AnalyticsStats timeRange={timeRange} stats={analyticsData.stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatusBarChart timeRange={timeRange} data={analyticsData.statusChart} />
            <MonthlyLineChart timeRange={timeRange} data={analyticsData.trendChart} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategoryDonutChart timeRange={timeRange} data={analyticsData.categoryChart} />
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">No data available</div>
      )}
    </div>
  );
}
