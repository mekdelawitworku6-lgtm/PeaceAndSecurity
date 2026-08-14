"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Search,
  RotateCw,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchReports,
  selectReports,
  selectReportsLoading,
  assignPatrol,
} from "@/lib/store/reportsSlice";
import { patrolService } from "@/lib/services/patrol-service";

const STATUS_DISPLAY: Record<string, string> = {
  SUBMITTED: "Active",
  ASSIGNED: "Active",
  IN_PROGRESS: "Investigating",
  UNDER_REVIEW: "Investigating",
  CLOSED: "Resolved",
  REJECTED: "Resolved",
  ESCALATED: "Escalated",
};

// Static officers list for assignment modal (could come from API later)
const OFFICERS_LIST = [
  "Rapid Response Unit 3",
  "Officer Sara Mulugeta",
  "Officer Dawit Tesfaye",
  "Investigation Unit 1",
  "Officer Getachew K.",
  "Officer Hanna Tadesse",
  "Special Events Unit",
  "Compliance Team 2",
  "Rapid Response Unit 2",
];

type ReportTab = "all" | "active" | "investigating" | "resolved";

export default function ReportsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const reports = useAppSelector(selectReports);
  const loading = useAppSelector(selectReportsLoading);

  const [activeTab, setActiveTab] = useState<ReportTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Assignment Modal state
  const [selectedReport, setSelectedReport] = useState<(typeof reports)[0] | null>(null);
  const [assignee, setAssignee] = useState<string>("");
  const [dispatchNote, setDispatchNote] = useState<string>("");

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  // Filters & Search
  const filteredReports = useMemo(() => {
    return reports.filter((report: any) => {
      if (activeTab === "active" && report.status !== "Active") return false;
      if (activeTab === "investigating" && report.status !== "Investigating") return false;
      if (activeTab === "resolved" && report.status !== "Resolved") return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          report.type.toLowerCase().includes(query) ||
          report.location.toLowerCase().includes(query) ||
          report.id.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [reports, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage]);

  const handleOpenAssignModal = (report: (typeof reports)[0]) => {
    setSelectedReport(report);
    setAssignee(report.assignedTo === "Unassigned" ? "" : report.assignedTo);
    setDispatchNote("");
  };

  const handleConfirmAssignment = () => {
    if (!assignee) {
      toast.error("Please select an officer or unit");
      return;
    }

    dispatch(assignPatrol({ reportId: selectedReport!.id, patrolId: assignee }))
      .unwrap()
      .then(() => {
        toast.success(`Successfully assigned report to ${assignee}`);
        setSelectedReport(null);
      })
      .catch(() => {
        toast.error("Failed to assign report. Please try again.");
      });
  };

  return (
    <div className="flex flex-col p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0c2340]">Reports Management</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar (Tabs and Search input side-by-side) */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-100">
            {(["all", "active", "investigating", "resolved"] as ReportTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold transition-all capitalize whitespace-nowrap",
                  activeTab === tab
                    ? "bg-[#0d2d82] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {tab === "all" ? "All Reports" : tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search orders..."
              className="pl-10 h-10 bg-white border-slate-200 rounded-lg text-sm focus:ring-[#0d2d82]/20"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && reports.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#0d2d82] animate-spin" />
            <span className="ml-2 text-sm text-slate-500 font-medium">Loading reports...</span>
          </div>
        )}

        {/* Table View */}
        {!loading || reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Priority</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Assigned To</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedReports.map((report: any) => (
                  <tr
                  key={report.id}
                  className="hover:bg-slate-50/40 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/reports/${report.id}`)}
                >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 text-sm hover:text-[#0d2d82]">{report.type}</span>
                        <span className="text-[10px] font-medium text-slate-400 font-mono mt-0.5">{report.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-slate-500 font-medium">{report.location}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                          report.status === "Active"
                            ? "bg-rose-50 text-rose-600 border-rose-100"
                            : report.status === "Investigating"
                            ? "bg-amber-50 text-amber-600 border-amber-100"
                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        )}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            report.priority === "High"
                              ? "bg-red-500"
                              : report.priority === "Medium"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          )}
                        />
                        <span className="text-[13px] text-slate-700 font-medium">{report.priority}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "text-[13px]",
                          report.assignedTo === "Unassigned"
                            ? "text-slate-400 italic"
                            : "text-[#0d2d82] font-bold"
                        )}
                      >
                        {report.assignedTo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-semibold text-slate-400">{report.date}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {report.assignedTo === "Unassigned" ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenAssignModal(report); }}
                          className="px-4 py-1.5 bg-[#0d2d82] hover:opacity-95 text-white font-bold text-xs rounded-full shadow-sm"
                        >
                          Assign
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/reports/${report.id}`); }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-full shadow-sm"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenAssignModal(report); }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-full shadow-sm"
                          >
                          <RotateCw className="w-3 h-3 text-slate-400" />
                          Reassign
                        </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedReports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                      No reports found fitting the criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Custom Pagination Footer matching Screenshot 3 */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-center gap-2 bg-slate-50/20">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-500 disabled:opacity-50 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            // Limit page pagination visualization
            if (totalPages > 5 && Math.abs(currentPage - pageNum) > 1 && pageNum !== 1 && pageNum !== totalPages) {
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return (
                  <span key={pageNum} className="px-2 text-slate-400 text-xs">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                  currentPage === pageNum
                    ? "bg-[#e2e8f0] text-slate-800"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-500 disabled:opacity-50 disabled:pointer-events-none"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Assign Report Modal popup (Screenshot 4) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 animate-in zoom-in-95 duration-300 mx-4">
            {/* Modal Header */}
            <div className="p-6 pb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Assign Report</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 pb-6 space-y-5">
              {/* Highlight Card */}
              <div className="bg-[#f0f4f9] rounded-xl p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm leading-tight">
                    {selectedReport.type}
                  </h4>
                  <p className="text-xs text-slate-500">{selectedReport.location}</p>
                  <p className="text-[10px] font-bold text-slate-400 font-mono leading-none pt-0.5">
                    {selectedReport.id}
                  </p>
                </div>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border whitespace-nowrap",
                    selectedReport.priority === "High"
                      ? "bg-rose-50 text-rose-600 border-rose-100"
                      : selectedReport.priority === "Medium"
                      ? "bg-amber-50 text-amber-600 border-amber-100"
                      : "bg-slate-50 text-slate-600 border-slate-100"
                  )}
                >
                  {selectedReport.priority} Priority
                </span>
              </div>

              {/* Select Assignee */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Assign to Officer or Unit</label>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-slate-50/50 font-semibold text-slate-700">
                    <SelectValue placeholder="Select officer or unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {OFFICERS_LIST.map((officer) => (
                      <SelectItem key={officer} value={officer} className="font-semibold text-slate-700">
                        {officer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dispatch Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Dispatch Note (Optional)</label>
                <textarea
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  placeholder="Add any special instructions or context for the assigned officer..."
                  className="w-full min-h-[90px] rounded-lg border border-slate-200 bg-slate-50/30 p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0d2d82]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 pt-0 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignment}
                className="px-5 py-2 bg-[#7a8da5] hover:bg-[#6c7d95] text-white font-bold text-sm rounded-lg shadow-sm transition-colors"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
