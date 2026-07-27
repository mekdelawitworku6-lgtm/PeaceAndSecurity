"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchAuditLogs,
  fetchSecurityEvents,
  fetchDataAccessEvents,
  selectAuditLogs,
  selectAuditTotal,
  selectAuditLoading,
  selectSecurityEvents,
  selectSecurityTotal,
  selectSecurityLoading,
  selectDataAccessEvents,
  selectDataAccessTotal,
  selectDataAccessLoading,
} from "@/lib/store/auditSlice";
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
import { auditService } from "@/lib/services/audit-service";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  FileDown,
  Activity,
  Users,
  Shield,
  UserCheck,
  Camera,
  Tag,
  MapPin,
  Building,
  Eye,
  Lock,
  CheckCircle,
  XCircle,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const entityTabs = [
  { key: "", label: "All Activity", icon: Activity },
  { key: "User", label: "Users", icon: Users },
  { key: "Report", label: "Reports", icon: FileText },
  { key: "Patrol", label: "Patrols", icon: Shield },
  { key: "Citizen", label: "Citizens", icon: UserCheck },
  { key: "Camera", label: "Cameras", icon: Camera },
  { key: "ReportType", label: "Report Types", icon: Tag },
  { key: "City", label: "Cities", icon: Building },
  { key: "Subcity", label: "Subcities", icon: MapPin },
  { key: "Woreda", label: "Woredas", icon: MapPin },
  { key: "PatrolTeam", label: "Patrol Teams", icon: Users },
  { key: "Conversation", label: "Conversations", icon: MessageSquare },
  { key: "Message", label: "Messages", icon: MessageSquare },
];

const mainTabs = [
  { key: "audit", label: "Audit Logs", icon: FileText },
  { key: "security", label: "Security Events", icon: Lock },
  { key: "data-access", label: "Data Access Events", icon: Eye },
];

function getActionBadge(action: string) {
  const colors: Record<string, string> = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    BUSINESS: "bg-purple-100 text-purple-800",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[action] || "bg-gray-100 text-gray-800"}`}>
      {action}
    </span>
  );
}

function getSecurityBadge(success: boolean) {
  return success ? (
    <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
      <CheckCircle className="h-3 w-3" /> Success
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
      <XCircle className="h-3 w-3" /> Failed
    </span>
  );
}

function Pagination({
  page,
  total,
  limit,
  onPageChange,
}: {
  page: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / limit);
  if (total <= limit) return null;

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} &bull; {total} total entries
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AuditLogsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const logs = useAppSelector(selectAuditLogs);
  const total = useAppSelector(selectAuditTotal);
  const loading = useAppSelector(selectAuditLoading);
  const securityEvents = useAppSelector(selectSecurityEvents);
  const securityTotal = useAppSelector(selectSecurityTotal);
  const securityLoading = useAppSelector(selectSecurityLoading);
  const dataAccessEvents = useAppSelector(selectDataAccessEvents);
  const dataAccessTotal = useAppSelector(selectDataAccessTotal);
  const dataAccessLoading = useAppSelector(selectDataAccessLoading);

  const [activeTab, setActiveTab] = useState("audit");
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const limit = 50;

  const [securityPage, setSecurityPage] = useState(1);
  const [securityTypeFilter, setSecurityTypeFilter] = useState("");

  const [dataAccessPage, setDataAccessPage] = useState(1);
  const [dataAccessTypeFilter, setDataAccessTypeFilter] = useState("");

  useEffect(() => {
    if (activeTab === "audit") {
      dispatch(
        fetchAuditLogs({
          page,
          limit,
          entity: entityFilter || undefined,
          action: actionFilter || undefined,
          startDate: fromDate || undefined,
          endDate: toDate || undefined,
        })
      );
    }
  }, [dispatch, page, entityFilter, actionFilter, fromDate, toDate, activeTab]);

  useEffect(() => {
    if (activeTab === "security") {
      dispatch(
        fetchSecurityEvents({
          page: securityPage,
          limit,
          eventType: securityTypeFilter || undefined,
          startDate: fromDate || undefined,
          endDate: toDate || undefined,
        })
      );
    }
  }, [dispatch, securityPage, securityTypeFilter, fromDate, toDate, activeTab]);

  useEffect(() => {
    if (activeTab === "data-access") {
      dispatch(
        fetchDataAccessEvents({
          page: dataAccessPage,
          limit,
          accessType: dataAccessTypeFilter || undefined,
          startDate: fromDate || undefined,
          endDate: toDate || undefined,
        })
      );
    }
  }, [dispatch, dataAccessPage, dataAccessTypeFilter, fromDate, toDate, activeTab]);

  const handleEntityChange = (key: string) => {
    setEntityFilter(key);
    setPage(1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    setSecurityPage(1);
    setDataAccessPage(1);
  };

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0c2340] tracking-tight">
          Audit Logs
        </h1>
        {activeTab === "audit" && (
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
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 border-b border-slate-200 pb-0">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg border border-b-0",
                activeTab === tab.key
                  ? "bg-white border-slate-200 text-[#0d2d82]"
                  : "bg-slate-50 border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-6">
        {/* Entity sidebar (only for audit logs tab) */}
        {activeTab === "audit" && (
          <aside className="w-56 shrink-0">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                  Entity Type
                </p>
              </div>
              <nav className="p-2 space-y-0.5">
                {entityTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = entityFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleEntityChange(tab.key)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-[#0d2d82] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-white" : "text-slate-400"
                        )}
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}

        <div className="flex-1 min-w-0 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-end">
                {activeTab === "audit" && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium mb-1 block">Action</label>
                    <Select
                      value={actionFilter || "all"}
                      onValueChange={(v) => {
                        setActionFilter(v === "all" ? "" : v);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All actions</SelectItem>
                        <SelectItem value="CREATE">CREATE</SelectItem>
                        <SelectItem value="UPDATE">UPDATE</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="BUSINESS">BUSINESS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {activeTab === "security" && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium mb-1 block">Event Type</label>
                    <Select
                      value={securityTypeFilter || "all"}
                      onValueChange={(v) => {
                        setSecurityTypeFilter(v === "all" ? "" : v);
                        setSecurityPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All events" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All events</SelectItem>
                        <SelectItem value="LOGIN_SUCCESS">LOGIN_SUCCESS</SelectItem>
                        <SelectItem value="LOGIN_FAILURE">LOGIN_FAILURE</SelectItem>
                        <SelectItem value="OTP_REQUESTED">OTP_REQUESTED</SelectItem>
                        <SelectItem value="OTP_VERIFIED">OTP_VERIFIED</SelectItem>
                        <SelectItem value="OTP_FAILED">OTP_FAILED</SelectItem>
                        <SelectItem value="PIN_CHANGED">PIN_CHANGED</SelectItem>
                        <SelectItem value="PIN_RESET_REQUESTED">PIN_RESET_REQUESTED</SelectItem>
                        <SelectItem value="PIN_RESET_COMPLETED">PIN_RESET_COMPLETED</SelectItem>
                        <SelectItem value="PASSWORD_CHANGED">PASSWORD_CHANGED</SelectItem>
                        <SelectItem value="PASSWORD_RESET_REQUESTED">PASSWORD_RESET_REQUESTED</SelectItem>
                        <SelectItem value="PASSWORD_RESET_COMPLETED">PASSWORD_RESET_COMPLETED</SelectItem>
                        <SelectItem value="TOKEN_REFRESH">TOKEN_REFRESH</SelectItem>
                        <SelectItem value="ACCOUNT_LOCKED">ACCOUNT_LOCKED</SelectItem>
                        <SelectItem value="ROLE_CHANGED">ROLE_CHANGED</SelectItem>
                        <SelectItem value="PERMISSION_DENIED">PERMISSION_DENIED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {activeTab === "data-access" && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium mb-1 block">Access Type</label>
                    <Select
                      value={dataAccessTypeFilter || "all"}
                      onValueChange={(v) => {
                        setDataAccessTypeFilter(v === "all" ? "" : v);
                        setDataAccessPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All access types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All access types</SelectItem>
                        <SelectItem value="VIEW_REPORT_LIST">VIEW_REPORT_LIST</SelectItem>
                        <SelectItem value="VIEW_REPORT_DETAIL">VIEW_REPORT_DETAIL</SelectItem>
                        <SelectItem value="VIEW_USER_LIST">VIEW_USER_LIST</SelectItem>
                        <SelectItem value="VIEW_CITIZEN_LIST">VIEW_CITIZEN_LIST</SelectItem>
                        <SelectItem value="VIEW_CITIZEN_PROFILE">VIEW_CITIZEN_PROFILE</SelectItem>
                        <SelectItem value="VIEW_PATROL_LIST">VIEW_PATROL_LIST</SelectItem>
                        <SelectItem value="VIEW_PATROL_TEAM_LIST">VIEW_PATROL_TEAM_LIST</SelectItem>
                        <SelectItem value="VIEW_CONVERSATION_LIST">VIEW_CONVERSATION_LIST</SelectItem>
                        <SelectItem value="VIEW_CONVERSATION_MESSAGES">VIEW_CONVERSATION_MESSAGES</SelectItem>
                        <SelectItem value="VIEW_DASHBOARD_STATS">VIEW_DASHBOARD_STATS</SelectItem>
                        <SelectItem value="VIEW_AUDIT_LOGS">VIEW_AUDIT_LOGS</SelectItem>
                        <SelectItem value="EXPORT_CSV">EXPORT_CSV</SelectItem>
                        <SelectItem value="EXPORT_PDF">EXPORT_PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex-1 min-w-[150px]">
                  <label className="text-sm font-medium mb-1 block">From</label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(1);
                      setSecurityPage(1);
                      setDataAccessPage(1);
                    }}
                  />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="text-sm font-medium mb-1 block">To</label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(1);
                      setSecurityPage(1);
                      setDataAccessPage(1);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Tab */}
          {activeTab === "audit" && (
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
                    {logs.map((log: any) => {
                      const isConversation = log.entity === "Conversation";
                      const isMessage = log.entity === "Message";
                      const detailUrl = isConversation
                        ? `/dashboard/chat/${log.entityId}`
                        : isMessage
                          ? `/dashboard/chat/${log.newValues?.conversationId || log.entityId}`
                          : null;
                      const nv = log.newValues || {};

                      return (
                        <div key={log.id} className="border rounded-lg p-3 space-y-1.5">
                          <div className="flex items-center gap-3 flex-wrap">
                            {getActionBadge(log.action)}
                            <span className="font-medium text-sm">{log.entity}</span>
                            <span className="text-xs text-muted-foreground">
                              ID: {log.entityId?.slice(0, 8)}
                            </span>
                            {isMessage && nv.senderName && (
                              <span className="text-xs font-medium text-slate-600">
                                by {nv.senderName} ({nv.senderType})
                              </span>
                            )}
                            {isConversation && nv.reportId && (
                              <span className="text-xs text-muted-foreground">
                                Report: {nv.reportId?.slice(0, 8)}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            By: {log.actorName || log.actorId} &bull;{" "}
                            {log.actorRole || ""} &bull; {log.ipAddress}
                          </p>
                          {log.description && (
                            <p className="text-xs text-muted-foreground">{log.description}</p>
                          )}
                          {isMessage && nv.content && (
                            <p className="text-xs text-slate-700 bg-slate-50 rounded p-2 border border-slate-100">
                              &ldquo;{nv.content}&rdquo;
                              {nv.readBy?.length > 0 && (
                                <span className="text-green-600 ml-2">
                                  &bull; Read by {nv.readBy.length}
                                </span>
                              )}
                            </p>
                          )}
                          {(log.oldValues || log.newValues) && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground">
                                {log.action === "CREATE" ? "Created Data" : log.action === "DELETE" ? "Deleted Data" : "Changes"}
                              </summary>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                {log.oldValues && log.newValues
                                  ? JSON.stringify({ old: log.oldValues, new: log.newValues }, null, 2)
                                  : JSON.stringify(log.newValues || log.oldValues, null, 2)}
                              </pre>
                            </details>
                          )}
                          {detailUrl && (
                            <button
                              onClick={() => router.push(detailUrl)}
                              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View {isConversation ? "Conversation" : "Message"} Details
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
              </CardContent>
            </Card>
          )}

          {/* Security Events Tab */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Events ({securityTotal} entries)</CardTitle>
              </CardHeader>
              <CardContent>
                {securityLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : securityEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No security events found</p>
                ) : (
                  <div className="space-y-2">
                    {securityEvents.map((event: any) => (
                      <div key={event.id} className="border rounded-lg p-3 space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          {getSecurityBadge(event.success)}
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                            {event.eventType}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Actor: {event.actorName || event.actorId || "System"} &bull;{" "}
                          {event.actorRole || ""} &bull; {event.ipAddress || "N/A"}
                        </p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        )}
                        {event.metadata && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground">
                              Details
                            </summary>
                            <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Pagination
                  page={securityPage}
                  total={securityTotal}
                  limit={limit}
                  onPageChange={setSecurityPage}
                />
              </CardContent>
            </Card>
          )}

          {/* Data Access Events Tab */}
          {activeTab === "data-access" && (
            <Card>
              <CardHeader>
                <CardTitle>Data Access Events ({dataAccessTotal} entries)</CardTitle>
              </CardHeader>
              <CardContent>
                {dataAccessLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : dataAccessEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No data access events found</p>
                ) : (
                  <div className="space-y-2">
                    {dataAccessEvents.map((event: any) => (
                      <div key={event.id} className="border rounded-lg p-3 space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {event.accessType}
                          </span>
                          <span className="text-sm font-medium">
                            {event.targetEntity}
                            {event.targetId && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({event.targetId?.slice(0, 8)})
                              </span>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Actor: {event.actorName || event.actorId || "System"} &bull;{" "}
                          {event.actorRole || ""} &bull; {event.accessPath || ""}
                        </p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Pagination
                  page={dataAccessPage}
                  total={dataAccessTotal}
                  limit={limit}
                  onPageChange={setDataAccessPage}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
