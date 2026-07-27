"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth-context";
import { UserRole, ROLE_LABELS } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchCities,
  fetchSubcities,
  fetchWoredas,
  selectCities,
  selectSubcities,
  selectWoredas,
} from "@/lib/store/geoSlice";
import { UserForm } from "@/components/forms/user-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { userService } from "@/lib/services/user-service";
import {
  ReusableTable,
  actionsColumn,
  statusColumn,
  Column,
} from "@/components/tables";
import { DashboardPagination } from "@/components/tables/dashboard-pagination";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layouts/page-header";
import {
  Plus,
  Search,
  X,
  Phone,
  Mail,
  User as UserIcon,
  Building,
  MapPin,
} from "lucide-react";
import { getImageUrl, cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function UserManagementPage() {
  const { user, hasPermission } = useAuth();
  const dispatch = useAppDispatch();
  const cities = useAppSelector(selectCities);
  const subcities = useAppSelector(selectSubcities);
  const woredas = useAppSelector(selectWoredas);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [subcityFilter, setSubcityFilter] = useState<string>("ALL");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<"delete" | "reset">("delete");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const userRole = user?.role as UserRole;
  const isSuperAdmin =
    userRole === UserRole.SYSTEM_SUPER_ADMIN ||
    userRole === UserRole.SYSTEM_ADMIN ||
    userRole === UserRole.PEACE_SUPER_ADMIN;
  const isSubcityLevel =
    userRole === UserRole.POLICE_COMMANDER_SUBCITY ||
    userRole === UserRole.PEACE_OFFICER_SUBCITY;

  useEffect(() => {
    dispatch(fetchCities());
    dispatch(fetchSubcities());
    dispatch(fetchWoredas());
  }, [dispatch]);

  useEffect(() => {
    loadUsers();
  }, [page, limit, searchTerm, roleFilter, statusFilter, subcityFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers({
        page,
        limit,
        search: searchTerm || undefined,
        role: roleFilter === "ALL" ? undefined : roleFilter,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        subcityId: subcityFilter === "ALL" ? undefined : subcityFilter,
      });
      const userList = res.data || [];
      setUsers(
        userList.map((u: any) => ({
          ...u,
          name: String(u.fullName || u.name || "Unknown"),
        }))
      );
      setTotal(res.total || userList.length);
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const getGeoLabel = (u: any) => {
    const parts: string[] = [];
    if (u.city?.name) parts.push(u.city.name);
    else if (u.subcity?.city?.name) parts.push(u.subcity.city.name);
    if (u.subcity?.name) parts.push(u.subcity.name);
    else if (u.woreda?.subcity?.name) parts.push(u.woreda.subcity.name);
    if (u.woreda?.name) parts.push(u.woreda.name);
    return parts.join(" > ") || "—";
  };

  const handleFormSave = async (formData: FormData) => {
    setFormLoading(true);
    const loadingToast = toast.loading(
      editingUser?._isNew ? "Creating officer..." : "Updating officer..."
    );
    try {
      if (editingUser?._isNew) {
        await userService.registerUser(formData);
        toast.success("Officer created", { id: loadingToast });
      } else {
        await userService.updateUser(editingUser.id, formData);
        toast.success("Officer updated", { id: loadingToast });
      }
      setFormOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to save";
      toast.error(msg, { id: loadingToast });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (u: any) => {
    setConfirmTarget(u);
    setConfirmAction("delete");
    setConfirmOpen(true);
  };

  const handleResetPassword = (u: any) => {
    setConfirmTarget(u);
    setConfirmAction("reset");
    setConfirmOpen(true);
  };

  const executeConfirm = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    const isMobileUser =
      confirmTarget.role === UserRole.PATROL || confirmTarget.role === UserRole.CITIZEN;
    const credentialType = isMobileUser ? "PIN" : "password";
    try {
      if (confirmAction === "delete") {
        await userService.deleteUser(confirmTarget.id);
        toast.success("Officer deleted");
        loadUsers();
      } else {
        const loadingToast = toast.loading(`Resetting ${credentialType}...`);
        await userService.resetUserPassword(confirmTarget.id);
        toast.success(`${credentialType} reset successfully. User notified via SMS.`, { id: loadingToast });
      }
      setConfirmOpen(false);
      setConfirmTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Action failed");
    } finally {
      setConfirmLoading(false);
    }
  };

  const openCreateOfficer = (
    role: string,
    geoId: string,
    geoLevel: "subcity" | "woreda"
  ) => {
    setEditingUser({
      role,
      ...(geoLevel === "subcity" ? { subcityId: geoId } : { woredaId: geoId }),
      _isNew: true,
    });
    setFormOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
    setSubcityFilter("ALL");
    setPage(1);
  };

  const columns: Column<any>[] = [
    {
      key: "fullName",
      header: "Officer",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
            {row.profileImage ? (
              <img
                src={getImageUrl(row.profileImage)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400">
                <UserIcon size={18} />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{row.fullName}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {row.id.substring(0, 8)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => {
        const isPeace = row.role?.startsWith("PEACE");
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              isPeace
                ? "bg-blue-50 text-blue-600 border-blue-100"
                : "bg-amber-50 text-amber-600 border-amber-100"
            )}
          >
            {ROLE_LABELS[row.role] || row.role?.replace(/_/g, " ")}
          </Badge>
        );
      },
    },
    {
      key: "contact",
      header: "Contact",
      render: (row) => (
        <div className="flex flex-col gap-1">
          {row.phoneNumber && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Phone size={11} className="text-slate-400" />
              {row.phoneNumber}
            </div>
          )}
          {row.email && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Mail size={11} className="text-slate-400" />
              {row.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "geo",
      header: "Geographic Area",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          {(row.city || row.subcity || row.woreda) ? (
            <>
              <MapPin size={11} className="text-slate-400 shrink-0" />
              <span>{getGeoLabel(row)}</span>
            </>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </div>
      ),
    },
    statusColumn<any>(),
    actionsColumn<any>({
      onEdit: (row) => {
        setEditingUser(row);
        setFormOpen(true);
      },
      editPermission: PERMISSIONS.USER_UPDATE,
      onDelete: handleDelete,
      deletePermission: PERMISSIONS.USER_DELETE,
      onResetPassword: hasPermission(PERMISSIONS.SETTINGS_RESET_PASSWORD)
        ? handleResetPassword
        : undefined,
      resetPasswordPermission: PERMISSIONS.SETTINGS_RESET_PASSWORD,
    }),
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="User Management"
        description={
          isSuperAdmin
            ? "Create and manage officers for subcities and woredas."
            : "Create and manage woreda-level officers."
        }
        className="flex-col items-start! w-full! gap-4"
      >
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between w-full gap-4 mt-2">
          <div className="relative w-full xl:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search officers..."
              className="pl-10 h-11 rounded border-slate-200 w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 flex-1 lg:justify-start xl:justify-center">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 w-full sm:w-auto"
            >
              <option value="ALL">All Roles</option>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={subcityFilter}
              onChange={(e) => {
                setSubcityFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 w-full sm:w-auto"
            >
              <option value="ALL">All Subcities</option>
              {subcities.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-11 rounded border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 w-full sm:w-auto"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="DISABLED">Disabled</option>
            </select>

            {(searchTerm !== "" ||
              roleFilter !== "ALL" ||
              statusFilter !== "ALL" ||
              subcityFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                className="h-11 w-11 rounded hidden sm:flex"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {(searchTerm !== "" ||
              roleFilter !== "ALL" ||
              statusFilter !== "ALL" ||
              subcityFilter !== "ALL") && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="h-11 rounded sm:hidden flex-1 border-slate-200"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full xl:w-auto">
            <Button
              onClick={() => {
                setEditingUser({ role: UserRole.POLICE_COMMANDER_SUBCITY, _isNew: true });
                setFormOpen(true);
              }}
              className="h-11 rounded px-5 bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-sm shrink-0 flex-1 xl:flex-none"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Police Commander
            </Button>
            <Button
              onClick={() => {
                setEditingUser({ role: UserRole.PEACE_OFFICER_SUBCITY, _isNew: true });
                setFormOpen(true);
              }}
              className="h-11 rounded px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm shrink-0 flex-1 xl:flex-none"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Peace Officer
            </Button>
          </div>
        </div>
      </PageHeader>

      <div className="bg-white rounded border border-slate-100 shadow-sm overflow-hidden">
        <ReusableTable
          data={users}
          columns={columns}
          getRowKey={(row) => row.id}
          isLoading={loading}
          emptyText={loading ? "Loading officers..." : "No officers found"}
        />
      </div>

      <DashboardPagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={setLimit}
      />

      {formOpen && (
        <UserForm
          onOpenChange={(open) => {
            if (!open) {
              setFormOpen(false);
              setEditingUser(null);
            }
          }}
          onSave={handleFormSave}
          initialData={editingUser}
          isNew={!!editingUser?._isNew}
          isLoading={formLoading}
          defaultRole={editingUser?.role}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmAction === "delete" ? "Delete Officer" : "Reset Password"}
        description={
          confirmAction === "delete"
            ? `Delete ${confirmTarget?.fullName}? This cannot be undone.`
            : `Reset password for ${confirmTarget?.fullName}? A new password will be sent via SMS.`
        }
        confirmLabel={confirmAction === "delete" ? "Delete" : "Reset"}
        variant="destructive"
        loading={confirmLoading}
        onConfirm={executeConfirm}
      />
    </div>
  );
}
