"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth-context";
import { ROLE_LABELS } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, FileText, Plus, Search, X } from "lucide-react";
import { workReportService, WorkReport } from "@/lib/services/work-report-service";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: "bg-amber-100 text-amber-800 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function formatDateTime(value?: string | Date) {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toLocaleString();
}

function formatTime(value?: string | Date) {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function WorkReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const isStaff = user?.role !== "PATROL" && user?.role !== "CITIZEN";

  const load = async () => {
    setLoading(true);
    try {
      const res = await workReportService.getAll({
        page,
        limit: 10,
        ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
        ...(roleFilter !== "ALL" ? { reporterRole: roleFilter } : {}),
        ...(search ? { search } : {}),
        ...(dateRange?.from ? { from: format(dateRange.from, "yyyy-MM-dd") } : {}),
        ...(dateRange?.to ? { to: format(dateRange.to, "yyyy-MM-dd") } : {}),
      });
      const data = res.data as any;
      setReports(
        Array.isArray(data)
          ? data
          : (data?.data as WorkReport[]) ?? [],
      );
      setTotal((res as any)?.total ?? data?.total ?? (Array.isArray(data) ? data.length : 0));
    } catch {
      toast.error("Failed to load work reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, roleFilter, search, dateRange]);

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    setReviewingId(id);
    try {
      await workReportService.review(id, status, reviewNote || undefined);
      toast.success(`Report ${status.toLowerCase()}`);
      setReviewNote("");
      load();
    } catch {
      toast.error("Failed to update report");
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Work Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Daily work submissions from patrol officers and staff
          </p>
        </div>
        {isStaff && (
          <Button onClick={() => setSubmitOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Submit Work Report
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search title or reporter..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            <SelectItem value="PATROL">Patrol Officer</SelectItem>
            <SelectItem value="PEACE_OFFICER_SUBCITY">Peace &amp; Security Subcity</SelectItem>
            <SelectItem value="PEACE_OFFICER_WOREDA">Peace &amp; Security Woreda</SelectItem>
            <SelectItem value="POLICE_COMMANDER_CITY">Police Commander City</SelectItem>
            <SelectItem value="POLICE_COMMANDER_SUBCITY">Police Commander Subcity</SelectItem>
            <SelectItem value="POLICE_COMMANDER_WOREDA">Police Commander Woreda</SelectItem>
            <SelectItem value="SYSTEM_SUPER_ADMIN">System Super Admin</SelectItem>
            <SelectItem value="SYSTEM_ADMIN">System Admin</SelectItem>
          </SelectContent>
        </Select>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        {(search !== "" ||
          statusFilter !== "ALL" ||
          roleFilter !== "ALL" ||
          dateRange?.from) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setStatusFilter("ALL");
              setRoleFilter("ALL");
              setDateRange(undefined);
              setPage(1);
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : reports.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText className="size-5" />
            </EmptyMedia>
          </EmptyHeader>
          <EmptyTitle>No work reports yet</EmptyTitle>
          <EmptyDescription>
            Submissions from patrols and staff will appear here
          </EmptyDescription>
        </Empty>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Reporter</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">{r.title}</p>
                      <p className="text-xs text-slate-400 max-w-[280px] truncate">
                        {r.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.reporterName || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-slate-500">
                        {ROLE_LABELS[r.reporterRole] || r.reporterRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="flex flex-col leading-tight">
                        <span>{r.reportDate ? formatDate(r.reportDate) : formatDateTime(r.createdAt)}</span>
                        <span className="text-[11px] text-slate-400">{r.createdAt ? formatTime(r.createdAt) : ""}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={STATUS_STYLES[r.status] || ""}
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {isStaff && r.status === "SUBMITTED" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            disabled={reviewingId === r.id}
                            onClick={() => handleReview(r.id, "APPROVED")}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            disabled={reviewingId === r.id}
                            onClick={() => handleReview(r.id, "REJECTED")}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <p className="text-right text-xs text-slate-400">
                          {r.reviewNote || ""}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{total} total</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>
              <span className="flex items-center px-2">Page {page}</span>
              <Button
                size="sm"
                variant="outline"
                disabled={reports.length < 10}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Work Report</DialogTitle>
            <DialogDescription>
              Report your daily activities, incidents handled, and notes
            </DialogDescription>
          </DialogHeader>
          <SubmitForm
            onDone={(ok) => {
              if (ok) {
                toast.success("Work report submitted");
                load();
              }
              setSubmitOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!reviewNote && reviewingId === null} onOpenChange={() => setReviewNote("")}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Review Note</DialogTitle>
          </DialogHeader>
          <Input
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Optional note..."
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubmitForm({ onDone }: { onDone: (ok: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSaving(true);
    try {
      await workReportService.create({
        title: title.trim(),
        description: description.trim(),
        reportDate: date,
      });
      onDone(true);
    } catch {
      toast.error("Failed to submit work report");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Daily shift report"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <textarea
          className="w-full min-h-28 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your activities, incidents handled, patrol routes..."
        />
      </div>
      <div className="space-y-1.5">
        <Label>Report Date</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <Button
        className="w-full"
        disabled={saving}
        onClick={handleSubmit}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
      </Button>
    </div>
  );
}