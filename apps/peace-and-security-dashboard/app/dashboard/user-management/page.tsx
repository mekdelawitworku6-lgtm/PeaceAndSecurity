"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth-context";
import { UserRole } from "@/lib/auth";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { userService } from "@/lib/services/user-service";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Building,
  MapPin,
  FileText,
  Loader2,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WOREDA_ROLES = [
  { value: "POLICE_COMMANDER_WOREDA", label: "Police Commander Woreda" },
  { value: "PEACE_OFFICER_WOREDA", label: "Peace Officer Woreda" },
];

const SUBCITY_ROLES = [
  { value: "POLICE_COMMANDER_SUBCITY", label: "Police Commander Subcity" },
  { value: "PEACE_OFFICER_SUBCITY", label: "Peace Officer Subcity" },
];

export default function UserManagementPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const cities = useAppSelector(selectCities);
  const subcities = useAppSelector(selectSubcities);
  const woredas = useAppSelector(selectWoredas);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubcities, setExpandedSubcities] = useState<Set<string>>(new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Quick create geo unit dialog
  const [geoDialogOpen, setGeoDialogOpen] = useState(false);
  const [geoType, setGeoType] = useState<"subcity" | "woreda">("subcity");
  const [geoParentId, setGeoParentId] = useState("");
  const [geoName, setGeoName] = useState("");
  const [geoCode, setGeoCode] = useState("");
  const [geoSaving, setGeoSaving] = useState(false);

  const userRole = user?.role as UserRole;
  const isSuperAdmin = userRole === UserRole.SYSTEM_SUPER_ADMIN || userRole === UserRole.SYSTEM_ADMIN;
  const isSubcityLevel = userRole === UserRole.POLICE_COMMANDER_SUBCITY || userRole === UserRole.PEACE_OFFICER_SUBCITY;

  useEffect(() => {
    dispatch(fetchCities());
    dispatch(fetchSubcities());
    dispatch(fetchWoredas());
    loadUsers();
  }, [dispatch]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers({ limit: 200 });
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const getSubcityUsers = (subcityId: string) =>
    users.filter((u) => u.subcityId === subcityId && !u.woredaId);

  const getWoredaUsers = (woredaId: string) =>
    users.filter((u) => u.woredaId === woredaId);

  const toggleSubcity = (id: string) => {
    const next = new Set(expandedSubcities);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedSubcities(next);
  };

  const handleFormSave = async (formData: FormData) => {
    setFormLoading(true);
    const loadingToast = toast.loading(editingUser ? "Updating officer..." : "Creating officer...");
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
        toast.success("Officer updated", { id: loadingToast });
      } else {
        await userService.registerUser(formData);
        toast.success("Officer created", { id: loadingToast });
      }
      setFormOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save";
      toast.error(msg, { id: loadingToast });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await userService.deleteUser(userId);
      toast.success("Officer deleted");
      loadUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  const handleCreateGeoUnit = async () => {
    if (!geoName.trim()) { toast.error("Name is required"); return; }
    if (!geoCode.trim()) { toast.error("Code is required"); return; }
    setGeoSaving(true);
    try {
      const payload: any = { name: geoName.trim(), code: geoCode.trim(), isActive: true };
      if (geoType === "subcity") {
        payload.cityId = geoParentId;
      } else {
        payload.subcityId = geoParentId;
      }
      const token = localStorage.getItem("access_token");
      const url = geoType === "subcity" ? "/api/geo/subcities" : "/api/geo/woredas";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create");
      }
      toast.success(`${geoType === "subcity" ? "Subcity" : "Woreda"} created`);
      setGeoDialogOpen(false);
      setGeoName("");
      setGeoCode("");
      if (geoType === "subcity") dispatch(fetchSubcities());
      else dispatch(fetchWoredas());
    } catch (err: any) {
      toast.error(err?.message || "Failed to create");
    } finally {
      setGeoSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const isPeace = role.startsWith("PEACE");
    const label = role.replace(/_/g, " ").replace("POLICE COMMANDER ", "PC ").replace("PEACE OFFICER ", "PO ");
    return (
      <span className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-full",
        isPeace ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
      )}>
        {label}
      </span>
    );
  };

  const renderUserRow = (u: any) => (
    <div key={u.id} className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
          {(u.fullName || "?").charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-800 truncate">{u.fullName}</span>
            {getRoleBadge(u.role)}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {u.phoneNumber && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Phone className="w-2.5 h-2.5" />{u.phoneNumber}
              </span>
            )}
            {u.email && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Mail className="w-2.5 h-2.5" />{u.email}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded",
          u.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
        )}>
          {u.status}
        </span>
        <button
          onClick={() => { setEditingUser(u); setFormOpen(true); }}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleDelete(u.id, u.fullName)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  // Super Admin sees subcities → creates subcity-level officers
  // Subcity Officer sees woredas → creates woreda-level officers
  const availableSubcities = isSuperAdmin
    ? subcities
    : subcities.filter((s: any) => s.id === (user as any)?.subcityId);

  const availableWoredas = isSubcityLevel
    ? woredas.filter((w: any) => w.subcityId === (user as any)?.subcityId)
    : [];

  const getInitialData = (role: string, geoId: string, geoLevel: "subcity" | "woreda") => ({
    role,
    ...(geoLevel === "subcity" ? { subcityId: geoId } : { woredaId: geoId }),
  });

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {isSuperAdmin && "Create and manage subcity-level officers."}
            {isSubcityLevel && "Create and manage woreda-level officers."}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isSuperAdmin ? (
        /* ─── SUPER ADMIN VIEW: Cities → Subcities → Officers ─── */
        <div className="space-y-4">
          {cities.map((city: any) => {
            const citySubcities = availableSubcities.filter((s: any) => s.cityId === city.id);
            return (
              <div key={city.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 bg-slate-50/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{city.name}</h3>
                      <p className="text-xs text-slate-400">{citySubcities.length} subcit{citySubcities.length !== 1 ? "ies" : "y"}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setGeoType("subcity"); setGeoParentId(city.id); setGeoName(""); setGeoCode(""); setGeoDialogOpen(true); }}
                    className="h-8 text-xs font-bold border-dashed"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Subcity
                  </Button>
                </div>

                <div className="p-4 space-y-3">
                  {citySubcities.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No subcities yet. Add one to start creating officers.</p>
                  ) : (
                    citySubcities.map((subcity: any) => {
                      const subcityOffUsers = getSubcityUsers(subcity.id);
                      const isExpanded = expandedSubcities.has(subcity.id);
                      return (
                        <div key={subcity.id} className="border border-slate-100 rounded-xl overflow-hidden">
                          <div
                            className="flex items-center justify-between px-4 py-3 bg-slate-50/50 cursor-pointer hover:bg-slate-100/50 transition-colors"
                            onClick={() => toggleSubcity(subcity.id)}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="font-semibold text-sm text-slate-700">{subcity.name}</span>
                              <span className="text-xs text-slate-400">
                                {subcityOffUsers.length} officer{subcityOffUsers.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {SUBCITY_ROLES.map((r) => (
                                <Button
                                  key={r.value}
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingUser(null);
                                    const initData = getInitialData(r.value, subcity.id, "subcity");
                                    setEditingUser({ ...initData, _isNew: true });
                                    setFormOpen(true);
                                  }}
                                  className="h-7 text-[10px] font-bold border-dashed"
                                >
                                  <Plus className="w-2.5 h-2.5 mr-0.5" />
                                  {r.label.replace("Police Commander ", "PC ").replace("Peace Officer ", "PO ")}
                                </Button>
                              ))}
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                            </div>
                          </div>
                          {isExpanded && subcityOffUsers.length > 0 && (
                            <div className="p-3 space-y-2">
                              {subcityOffUsers.map(renderUserRow)}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
          {cities.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <Building className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No cities found. Create cities in Geographic Units first.</p>
            </div>
          )}
        </div>
      ) : isSubcityLevel ? (
        /* ─── SUBCITY OFFICER VIEW: Woredas → Officers ─── */
        <div className="space-y-4">
          {availableWoredas.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">No woredas found under your subcity.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setGeoType("woreda"); setGeoParentId((user as any)?.subcityId || ""); setGeoName(""); setGeoCode(""); setGeoDialogOpen(true); }}
                className="mt-4 h-8 text-xs font-bold border-dashed"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Woreda
              </Button>
            </div>
          ) : (
            availableWoredas.map((woreda: any) => {
              const woredaOffUsers = getWoredaUsers(woreda.id);
              return (
                <div key={woreda.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="flex items-center justify-between px-5 py-4 bg-slate-50/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{woreda.name}</h3>
                        <p className="text-xs text-slate-400">{woredaOffUsers.length} officer{woredaOffUsers.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {WOREDA_ROLES.map((r) => (
                        <Button
                          key={r.value}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(null);
                            const initData = getInitialData(r.value, woreda.id, "woreda");
                            setEditingUser({ ...initData, _isNew: true });
                            setFormOpen(true);
                          }}
                          className="h-8 text-xs font-bold border-dashed"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {r.label.replace("Police Commander ", "PC ").replace("Peace Officer ", "PO ")}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {woredaOffUsers.length > 0 && (
                    <div className="p-4 space-y-2">
                      {woredaOffUsers.map(renderUserRow)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : null}

      {/* Officer Create/Edit Form */}
      {formOpen && editingUser && (
        <UserForm
          onOpenChange={(open) => { if (!open) { setFormOpen(false); setEditingUser(null); } }}
          onSave={handleFormSave}
          initialData={editingUser._isNew ? editingUser : editingUser}
          isNew={!!editingUser._isNew}
          isLoading={formLoading}
        />
      )}

      {/* Quick Geo Unit Create Dialog */}
      <Dialog open={geoDialogOpen} onOpenChange={(open) => { setGeoDialogOpen(open); if (!open) { setGeoName(""); setGeoCode(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add {geoType === "subcity" ? "Subcity" : "Woreda"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Name <span className="text-red-500">*</span></Label>
              <Input placeholder={`e.g. ${geoType === "subcity" ? "Bole" : "01"}`} value={geoName} onChange={(e) => setGeoName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Code <span className="text-red-500">*</span></Label>
              <Input placeholder={`e.g. ${geoType === "subcity" ? "BOLE-01" : "AA-01-01"}`} value={geoCode} onChange={(e) => setGeoCode(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGeoDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateGeoUnit} disabled={geoSaving}>
              {geoSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
