"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchAuditLogs,
  selectAuditLogs,
  selectAuditTotal,
  selectAuditLoading,
} from "@/lib/store/auditSlice";
import { auditService } from "@/lib/services/audit-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Filter, ChevronLeft, ChevronRight, FileText, FileDown } from "lucide-react";

export default function AuditLogsPage() {
  const dispatch = useAppDispatch();
  const logs = useAppSelector(selectAuditLogs);
  const total = useAppSelector(selectAuditTotal);
  const loading = useAppSelector(selectAuditLoading);

  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const limit = 50;

  useEffect(() => {
    dispatch(fetchAuditLogs({
      page,
      limit,
      entity: entityFilter || undefined,
      action: actionFilter || undefined,
      startDate: fromDate || undefined,
      endDate: toDate || undefined,
    }));
  }, [dispatch, page, entityFilter, actionFilter, fromDate, toDate]);

  const handleExportCsv = async () => {
    try {
      const response = await auditService.exportCsv({
        entity: entityFilter || undefined,
        action: actionFilter || undefined,
        startDate: fromDate || undefined,
        endDate: toDate || undefined,
      });
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("CSV exported successfully");
    } catch (e: any) {
      toast.error(e?.message || "Export failed");
    }
  };

  const handleExportPdf = async () => {
    try {
      const response = await auditService.exportPdf({
        entity: entityFilter || undefined,
        action: actionFilter || undefined,
        startDate: fromDate || undefined,
        endDate: toDate || undefined,
      });
      const blob = new Blob([response.data], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      toast.success("PDF exported successfully");
    } catch (e: any) {
      toast.error(e?.message || "Export failed");
    }
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: "bg-green-100 text-green-800",
      UPDATE: "bg-blue-100 text-blue-800",
      DELETE: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[action] || "bg-gray-100"}`}>
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCsv} variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleExportPdf} variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Entity</label>
              <Select value={entityFilter || "all"} onValueChange={(v) => { setEntityFilter(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="All entities" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All entities</SelectItem>
                  {["User", "Report", "Patrol", "Citizen", "Camera", "ReportType", "City", "Subcity", "Woreda", "PatrolTeam"].map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Action</label>
              <Select value={actionFilter || "all"} onValueChange={(v) => { setActionFilter(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger><SelectValue placeholder="All actions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="CREATE">CREATE</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium mb-1 block">From</label>
              <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium mb-1 block">To</label>
              <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail ({total} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No audit logs found</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log: any) => (
                <div key={log.id} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    {getActionBadge(log.action)}
                    <span className="font-medium text-sm">{log.entity}</span>
                    <span className="text-xs text-muted-foreground">ID: {log.entityId?.slice(0, 8)}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    By: {log.actorName || log.actorId} &bull; {log.actorRole || ""} &bull; {log.ipAddress}
                  </p>
                  {log.description && (
                    <p className="text-xs text-muted-foreground">{log.description}</p>
                  )}
                  {log.oldValues && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">Changes</summary>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify({ old: log.oldValues, new: log.newValues }, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {total > limit && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(total / limit)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
