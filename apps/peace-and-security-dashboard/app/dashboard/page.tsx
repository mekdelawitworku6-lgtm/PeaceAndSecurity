"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth-context";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchDashboardStats,
  fetchRecentReports,
  selectDashboardStats,
  selectRecentReports,
  selectDashboardLoading,
} from "@/lib/store/dashboardSlice";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Download,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PERMISSIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

type TimeRange = "week" | "month" | "year";

export default function DashboardPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectDashboardStats);
  const recentReports = useAppSelector(selectRecentReports);
  const loading = useAppSelector(selectDashboardLoading);
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.DASHBOARD_VIEW)) {
      router.replace("/dashboard/reports");
    }
  }, [user, hasPermission, router]);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentReports());
  }, [dispatch]);

  const statCards = [
    {
      label: "Total Reports",
      value: stats?.reports?.total ?? "—",
      trend: "+0%",
      isPositive: true,
    },
    {
      label: "Pending",
      value: stats?.reports?.pending ?? "—",
      trend: "+0%",
      isPositive: true,
    },
    {
      label: "Active Patrols",
      value: stats?.users?.patrols ?? "—",
      trend: "-0%",
      isPositive: false,
    },
    {
      label: "Total Resolved",
      value: stats?.reports?.resolved ?? "—",
      trend: "+0%",
      isPositive: true,
    },
  ];

  const categoryData = stats?.reports?.byType || [];
  const timeData = stats?.reports?.trend || [];
  const activities = recentReports?.length
    ? recentReports.slice(0, 4).map((r: any) => ({
        title: `${r.violationType || r.type || 'Report'} — ${r.address || r.location || ''}`,
        subtitle: `by ${r.reporter?.fullName || 'Citizen'} • ${r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}`,
        action: r.status || 'New',
      }))
    : [];

  const handleExportCSV = () => {
    const lines: string[] = [];
    lines.push("Peace & Security Dashboard Report");
    lines.push(`Time Range: ${timeRange}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("--- Summary ---");
    lines.push("Metric,Value");
    statCards.forEach((c) => lines.push(`"${c.label}","${c.value}"`));
    if (categoryData.length) {
      lines.push("");
      lines.push("--- Reports by Category ---");
      lines.push("Category,Count");
      categoryData.forEach((c: any) => lines.push(`"${c.name || c.category}",${c.count}`));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `peace-security-dashboard-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const content = `
      <html>
      <head>
        <title>Peace & Security Dashboard Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
          h1 { font-size: 22px; color: #0c2340; margin-bottom: 4px; }
          h2 { font-size: 16px; color: #0d2d82; margin-top: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
          .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 12px; }
          th { background: #f8fafc; font-weight: bold; color: #0c2340; }
        </style>
      </head>
      <body>
        <h1>Peace & Security Dashboard</h1>
        <div class="meta">Time Range: ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} | Generated: ${new Date().toLocaleString()}</div>
        <h2>Summary</h2>
        <table>
          <tr><th>Metric</th><th>Value</th></tr>
          ${statCards.map((c) => `<tr><td>${c.label}</td><td>${c.value}</td></tr>`).join("")}
        </table>
        ${categoryData.length ? `
        <h2>Reports by Category</h2>
        <table>
          <tr><th>Category</th><th>Count</th></tr>
          ${categoryData.map((c: any) => `<tr><td>${c.name || c.category}</td><td>${c.count}</td></tr>`).join("")}
        </table>` : ''}
      </body>
      </html>
    `;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0c2340] tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
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
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-600 shadow-sm transition-all">
              <Download className="w-3.5 h-3.5 text-slate-400" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Export as CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
              >
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && !stats ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, idx) => (
              <Card key={idx} className="border border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
                  <div className="flex items-baseline justify-between mt-4">
                    <span className="text-3xl font-black text-[#0c2340] tracking-tight">{card.value}</span>
                    <span
                      className={cn(
                        "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold border",
                        card.isPositive
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      )}
                    >
                      {card.isPositive ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {card.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {categoryData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 px-6 py-4">
                  <CardTitle className="text-sm font-bold text-[#0c2340]">Reports by Category</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData} margin={{ bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }}
                          angle={-30}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Tooltip
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#0d2d82" radius={[4, 4, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              {timeData.length > 0 && (
                <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 px-6 py-4">
                    <CardTitle className="text-sm font-bold text-[#0c2340]">Reports Over Time</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Line type="monotone" dataKey="count" stroke="#0d2d82" strokeWidth={2} dot={{ fill: '#0d2d82', r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activities.length > 0 && (
            <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 px-6 py-4">
                <CardTitle className="text-sm font-bold text-[#0c2340]">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {activities.map((activity: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-[#0d2d82]">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{activity.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{activity.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{activity.action}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
