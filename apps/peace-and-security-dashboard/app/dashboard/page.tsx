"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Download,
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

interface StatCard {
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
}

interface CategoryItem {
  name: string;
  count: number;
}

interface TimeDataItem {
  day: string | number;
  count: number;
}

interface ActivityItem {
  title: string;
  subtitle: string;
  action: string;
}

// ── Stat cards per time range ────────────────────────────────────────
const STAT_CARDS_BY_RANGE: Record<TimeRange, StatCard[]> = {
  week: [
    { label: "Total Reports", value: "87", trend: "+5.2%", isPositive: true },
    { label: "Active", value: "12", trend: "+2.1%", isPositive: true },
    { label: "Investigating", value: "23", trend: "-1.8%", isPositive: false },
    { label: "Total Resolved", value: "52", trend: "+11.3%", isPositive: true },
  ],
  month: [
    { label: "Total Reports", value: "342", trend: "+9.7%", isPositive: true },
    { label: "Active", value: "48", trend: "+6.3%", isPositive: true },
    { label: "Investigating", value: "89", trend: "-2.5%", isPositive: false },
    { label: "Total Resolved", value: "205", trend: "+8.1%", isPositive: true },
  ],
  year: [
    { label: "Total Reports", value: "1,243", trend: "+12.5%", isPositive: true },
    { label: "Active", value: "89", trend: "+8.5%", isPositive: true },
    { label: "Investigating", value: "156", trend: "-3.2%", isPositive: false },
    { label: "Total Resolved", value: "998", trend: "+9.7%", isPositive: true },
  ],
};

// ── Category bar chart data per time range ───────────────────────────
const CATEGORY_DATA_BY_RANGE: Record<TimeRange, CategoryItem[]> = {
  week: [
    { name: "Robbery/Theft", count: 18 },
    { name: "Illegal Weapons", count: 9 },
    { name: "Forgery/Fraud", count: 14 },
    { name: "Security Threat", count: 6 },
    { name: "Street Begging", count: 12 },
    { name: "Disruptive Activity", count: 8 },
    { name: "Unfit Area", count: 5 },
    { name: "Illegal Business", count: 10 },
    { name: "Event Security", count: 3 },
    { name: "Institution Inspection", count: 2 },
  ],
  month: [
    { name: "Robbery/Theft", count: 72 },
    { name: "Illegal Weapons", count: 38 },
    { name: "Forgery/Fraud", count: 58 },
    { name: "Security Threat", count: 24 },
    { name: "Street Begging", count: 52 },
    { name: "Disruptive Activity", count: 33 },
    { name: "Unfit Area", count: 27 },
    { name: "Illegal Business", count: 44 },
    { name: "Event Security", count: 15 },
    { name: "Institution Inspection", count: 11 },
  ],
  year: [
    { name: "Robbery/Theft", count: 240 },
    { name: "Illegal Weapons", count: 125 },
    { name: "Forgery/Fraud", count: 195 },
    { name: "Security Threat", count: 80 },
    { name: "Street Begging", count: 175 },
    { name: "Disruptive Activity", count: 110 },
    { name: "Unfit Area", count: 90 },
    { name: "Illegal Business", count: 145 },
    { name: "Event Security", count: 50 },
    { name: "Institution Inspection", count: 35 },
  ],
};

// ── Time-series line chart data per time range ───────────────────────
const TIME_DATA_BY_RANGE: Record<TimeRange, TimeDataItem[]> = {
  week: [
    { day: "Mon", count: 15 },
    { day: "Tue", count: 8 },
    { day: "Wed", count: 12 },
    { day: "Thu", count: 7 },
    { day: "Fri", count: 18 },
    { day: "Sat", count: 22 },
    { day: "Sun", count: 5 },
  ],
  month: [
    { day: "Week 1", count: 78 },
    { day: "Week 2", count: 92 },
    { day: "Week 3", count: 85 },
    { day: "Week 4", count: 87 },
  ],
  year: [
    { day: "Jan", count: 85 },
    { day: "Feb", count: 72 },
    { day: "Mar", count: 98 },
    { day: "Apr", count: 105 },
    { day: "May", count: 112 },
    { day: "Jun", count: 95 },
    { day: "Jul", count: 120 },
    { day: "Aug", count: 108 },
    { day: "Sep", count: 93 },
    { day: "Oct", count: 115 },
    { day: "Nov", count: 130 },
    { day: "Dec", count: 110 },
  ],
};

// ── Recent activity per time range ───────────────────────────────────
const RECENT_ACTIVITIES_BY_RANGE: Record<TimeRange, ActivityItem[]> = {
  week: [
    {
      title: "Robbery — Bole Road",
      subtitle: "by Officer Yamlak F. • 5 minutes ago",
      action: "Status changed to Investigating",
    },
    {
      title: "Illegal Weapons — Piazza",
      subtitle: "by Dispatcher Hanan A. • 12 minutes ago",
      action: "Assigned to Rapid Response Unit 2",
    },
    {
      title: "Unfit Area — CMC Road",
      subtitle: "by Officer Daniel T. • 35 minutes ago",
      action: "Marked as Resolved",
    },
  ],
  month: [
    {
      title: "Forgery/Fraud — Arat Kilo",
      subtitle: "by Officer Meron G. • 2 hours ago",
      action: "Escalated to Investigation Unit",
    },
    {
      title: "Street Begging — Mercato",
      subtitle: "by Officer Yonas B. • 5 hours ago",
      action: "Status changed to Investigating",
    },
    {
      title: "Disruptive Activity — Bole Mikael",
      subtitle: "by Dispatcher Sarah T. • 8 hours ago",
      action: "Assigned to Patrol Unit 5",
    },
    {
      title: "Robbery — Piazza",
      subtitle: "by Officer Daniel T. • 1 day ago",
      action: "Marked as Resolved",
    },
  ],
  year: [
    {
      title: "Robbery — Bole Road",
      subtitle: "by Officer Yamlak F. • 5 minutes ago",
      action: "Status changed to Investigating",
    },
    {
      title: "Illegal Weapons — Piazza",
      subtitle: "by Dispatcher Hanan A. • 12 minutes ago",
      action: "Assigned to Rapid Response Unit 2",
    },
    {
      title: "Unfit Area — CMC Road",
      subtitle: "by Officer Daniel T. • 35 minutes ago",
      action: "Marked as Resolved",
    },
    {
      title: "Forgery/Fraud — Arat Kilo",
      subtitle: "by Officer Meron G. • 2 hours ago",
      action: "Escalated to Investigation Unit",
    },
  ],
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.DASHBOARD_VIEW)) {
      router.replace("/dashboard/reports");
    }
  }, [user, hasPermission, router]);

  const statCards = STAT_CARDS_BY_RANGE[timeRange];
  const categoryData = CATEGORY_DATA_BY_RANGE[timeRange];
  const timeData = TIME_DATA_BY_RANGE[timeRange];
  const recentActivities = RECENT_ACTIVITIES_BY_RANGE[timeRange];

  const handleExportCSV = () => {
    const lines: string[] = [];
    lines.push("Peace & Security Dashboard Report");
    lines.push(`Time Range: ${timeRange}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("--- Summary ---");
    lines.push("Metric,Value,Trend");
    statCards.forEach((c) => lines.push(`"${c.label}","${c.value}","${c.trend}"`));
    lines.push("");
    lines.push("--- Reports by Category ---");
    lines.push("Category,Count");
    categoryData.forEach((c) => lines.push(`"${c.name}",${c.count}`));
    lines.push("");
    lines.push("--- Reports Over Time ---");
    lines.push("Period,Count");
    timeData.forEach((t) => lines.push(`"${t.day}",${t.count}`));
    lines.push("");
    lines.push("--- Recent Activity ---");
    lines.push("Title,Subtitle,Action");
    recentActivities.forEach((a) => lines.push(`"${a.title}","${a.subtitle}","${a.action}"`));

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
          .stat-grid { display: flex; gap: 12px; flex-wrap: wrap; }
          .stat-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; min-width: 140px; }
          .stat-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: bold; }
          .stat-value { font-size: 22px; font-weight: 900; color: #0c2340; margin-top: 4px; }
          .stat-trend { font-size: 11px; margin-top: 2px; }
          .trend-up { color: #059669; }
          .trend-down { color: #dc2626; }
        </style>
      </head>
      <body>
        <h1>Peace & Security Dashboard</h1>
        <div class="meta">Time Range: ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} | Generated: ${new Date().toLocaleString()}</div>

        <h2>Summary</h2>
        <div class="stat-grid">
          ${statCards.map((c) => `
            <div class="stat-card">
              <div class="stat-label">${c.label}</div>
              <div class="stat-value">${c.value}</div>
              <div class="stat-trend ${c.isPositive ? "trend-up" : "trend-down"}">${c.isPositive ? "+" : ""}${c.trend}</div>
            </div>
          `).join("")}
        </div>

        <h2>Reports by Category</h2>
        <table>
          <tr><th>Category</th><th>Count</th></tr>
          ${categoryData.map((c) => `<tr><td>${c.name}</td><td>${c.count}</td></tr>`).join("")}
        </table>

        <h2>Reports Over Time</h2>
        <table>
          <tr><th>Period</th><th>Count</th></tr>
          ${timeData.map((t) => `<tr><td>${t.day}</td><td>${t.count}</td></tr>`).join("")}
        </table>

        <h2>Recent Activity</h2>
        <table>
          <tr><th>Event</th><th>Details</th><th>Action</th></tr>
          ${recentActivities.map((a) => `<tr><td>${a.title}</td><td>${a.subtitle}</td><td>${a.action}</td></tr>`).join("")}
        </table>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0c2340] tracking-tight">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range tabs */}
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

      {/* Stats Cards */}
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

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by Category Bar Chart */}
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
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Reports Over Time Line Chart */}
        <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 px-6 py-4">
            <CardTitle className="text-sm font-bold text-[#0c2340]">
              {timeRange === "week" ? "Reports Over Time (7 Days)" : timeRange === "month" ? "Reports Over Time (4 Weeks)" : "Reports Over Time (12 Months)"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    interval={0}
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
                    dot={{ fill: '#0d2d82', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border border-slate-100 shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-50 px-6 py-4">
          <CardTitle className="text-sm font-bold text-[#0c2340]">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {recentActivities.map((activity, idx) => (
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
    </div>
  );
}
