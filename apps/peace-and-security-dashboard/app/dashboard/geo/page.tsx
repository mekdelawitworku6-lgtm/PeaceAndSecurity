"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context";
import { UserRole } from "@/lib/auth";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchCities,
  fetchSubcities,
  fetchWoredas,
  createCity,
  createSubcity,
  createWoreda,
  updateCity,
  updateSubcity,
  updateWoreda,
  deleteCity,
  deleteSubcity,
  deleteWoreda,
  selectCities,
  selectSubcities,
  selectWoredas,
  selectGeoLoading,
} from "@/lib/store/geoSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  MapPin,
  Building,
  FileText,
  Pencil,
  Globe,
} from "lucide-react";
import { MapPicker } from "@/components/maps/map-picker";
import { ReusableTable, Column } from "@/components/tables";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Tab = "cities" | "subcities" | "woredas";

const CITY_ROLES: UserRole[] = [
  UserRole.POLICE_COMMANDER_CITY,
  UserRole.PEACE_OFFICER_SUBCITY,
];

const SUBCITY_ROLES: UserRole[] = [
  UserRole.POLICE_COMMANDER_SUBCITY,
  UserRole.PEACE_OFFICER_WOREDA,
];

const SYSTEM_ROLES: UserRole[] = [
  UserRole.SYSTEM_SUPER_ADMIN,
  UserRole.SYSTEM_ADMIN,
  UserRole.PEACE_SUPER_ADMIN,
];

export default function GeoPage() {
  const dispatch = useAppDispatch();
  const cities = useAppSelector(selectCities);
  const subcities = useAppSelector(selectSubcities);
  const woredas = useAppSelector(selectWoredas);
  const loading = useAppSelector(selectGeoLoading);
  const { user } = useAuth();

  const userRole = user?.role as UserRole;
  const isSystemRole = SYSTEM_ROLES.includes(userRole);
  const isCityRole = CITY_ROLES.includes(userRole);
  const isSubcityRole = SUBCITY_ROLES.includes(userRole);

  const canManageCities = false;
  const canManageSubcities = isSystemRole || isCityRole;
  const canManageWoredas = isSubcityRole;

  const availableTabs: Tab[] = [];
  if (isSystemRole || isCityRole) availableTabs.push("subcities");
  if (isSubcityRole) availableTabs.push("woredas");

  const [activeTab, setActiveTab] = useState<Tab>(availableTabs[0] || "subcities");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ tab: Tab; id: string } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedSubcityId, setSelectedSubcityId] = useState("");

  useEffect(() => {
    dispatch(fetchCities());
    dispatch(fetchSubcities());
    dispatch(fetchWoredas());
  }, [dispatch]);

  const resetForm = () => {
    setName(""); setCode(""); setDescription("");
    setLatitude(""); setLongitude(""); setIsActive(true);
    setSelectedCityId(""); setSelectedSubcityId("");
    setEditItem(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setName(item.name || "");
    setCode(item.code || "");
    setDescription(item.description || "");
    setLatitude(String(item.latitude ?? ""));
    setLongitude(String(item.longitude ?? ""));
    setIsActive(item.isActive ?? true);
    setSelectedCityId(item.cityId || "");
    setSelectedSubcityId(item.subcityId || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!code.trim()) { toast.error("Code is required"); return; }

    try {
      const payload: any = {
        name: name.trim(),
        code: code.trim(),
        description: description.trim() || undefined,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        isActive,
      };

      if (editItem) {
        if (activeTab === "cities") {
          await dispatch(updateCity({ id: editItem.id, data: payload })).unwrap();
          toast.success("City updated");
        } else if (activeTab === "subcities") {
          await dispatch(updateSubcity({ id: editItem.id, data: payload })).unwrap();
          toast.success("Subcity updated");
        } else {
          await dispatch(updateWoreda({ id: editItem.id, data: payload })).unwrap();
          toast.success("Woreda updated");
        }
      } else {
        if (activeTab === "cities") {
          await dispatch(createCity(payload)).unwrap();
          toast.success("City created");
        } else if (activeTab === "subcities") {
          if (!selectedCityId) { toast.error("Select a city"); return; }
          await dispatch(createSubcity({ ...payload, cityId: selectedCityId })).unwrap();
          toast.success("Subcity created");
        } else {
          if (!selectedSubcityId) { toast.error("Select a subcity"); return; }
          await dispatch(createWoreda({ ...payload, subcityId: selectedSubcityId })).unwrap();
          toast.success("Woreda created");
        }
      }
      setDialogOpen(false);
      resetForm();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save");
    }
  };

  const handleDelete = (tab: Tab, id: string) => {
    setConfirmTarget({ tab, id });
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!confirmTarget) return;
    setConfirmLoading(true);
    try {
      if (confirmTarget.tab === "cities") await dispatch(deleteCity(confirmTarget.id)).unwrap();
      else if (confirmTarget.tab === "subcities") await dispatch(deleteSubcity(confirmTarget.id)).unwrap();
      else await dispatch(deleteWoreda(confirmTarget.id)).unwrap();
      toast.success("Deleted");
      setConfirmOpen(false);
      setConfirmTarget(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete");
    } finally {
      setConfirmLoading(false);
    }
  };

  const canCreateOnTab = (tab: Tab) => {
    if (tab === "cities") return canManageCities;
    if (tab === "subcities") return canManageSubcities;
    if (tab === "woredas") return canManageWoredas;
    return false;
  };

  const canEditOnTab = (tab: Tab) => {
    if (tab === "cities") return canManageCities;
    if (tab === "subcities") return canManageSubcities;
    if (tab === "woredas") return canManageWoredas;
    return false;
  };

  const getTabLabel = (tab: Tab) => {
    if (tab === "cities") return "Cities";
    if (tab === "subcities") return "Subcities";
    return "Woredas";
  };

  const getTabIcon = (tab: Tab) => {
    if (tab === "cities") return <Building className="w-4 h-4" />;
    if (tab === "subcities") return <MapPin className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getDialogTitle = () => {
    if (editItem) return `Edit ${getTabLabel(activeTab).slice(0, -1)}`;
    return `Add ${getTabLabel(activeTab).slice(0, -1)}`;
  };

  const currentItems = activeTab === "cities" ? cities : activeTab === "subcities" ? subcities : woredas;

  const nameColumn: Column<any> = {
    key: "name",
    header: "Name",
    render: (row) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.name}</span>
        {row.code && (
          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded">{row.code}</span>
        )}
      </div>
    ),
  };

  const activeColumn: Column<any> = {
    key: "isActive",
    header: "Status",
    render: (row) => (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${row.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
        {row.isActive ? "Active" : "Inactive"}
      </span>
    ),
  };

  const coordsColumn: Column<any> = {
    key: "coords",
    header: "Coordinates",
    render: (row) => (
      (row.latitude || row.longitude) ? (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Globe className="w-3 h-3" />
          {row.latitude}, {row.longitude}
        </span>
      ) : <span className="text-xs text-muted-foreground">-</span>
    ),
  };

  const makeActionsColumn = (tab: Tab): Column<any> => ({
    key: "actions",
    header: "Actions",
    className: "text-right",
    render: (row) => (
      canEditOnTab(tab) ? (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row)} className="h-8 w-8 p-0">
            <Pencil className="h-3.5 w-3.5 text-slate-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(tab, row.id)} className="h-8 w-8 p-0">
            <Trash2 className="h-3.5 w-3.5 text-red-500" />
          </Button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground px-2">View only</span>
      )
    ),
  });

  const cityColumns: Column<any>[] = [
    nameColumn,
    activeColumn,
    coordsColumn,
    makeActionsColumn("cities"),
  ];

  const subcityColumns: Column<any>[] = [
    nameColumn,
    {
      key: "city",
      header: "Parent City",
      render: (row) => (
        row.city ? (
          <span className="flex items-center gap-1 text-sm">
            <Building className="w-3 h-3" />
            {row.city.name}
          </span>
        ) : <span className="text-xs text-muted-foreground">-</span>
      ),
    },
    activeColumn,
    coordsColumn,
    makeActionsColumn("subcities"),
  ];

  const woredaColumns: Column<any>[] = [
    nameColumn,
    {
      key: "subcity",
      header: "Parent Subcity",
      render: (row) => (
        row.subcity ? (
          <span className="flex items-center gap-1 text-sm">
            <MapPin className="w-3 h-3" />
            {row.subcity.name}
          </span>
        ) : <span className="text-xs text-muted-foreground">-</span>
      ),
    },
    activeColumn,
    coordsColumn,
    makeActionsColumn("woredas"),
  ];

  const tabColumns: Record<Tab, Column<any>[]> = {
    cities: cityColumns,
    subcities: subcityColumns,
    woredas: woredaColumns,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Geographic Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSystemRole && "Manage cities, subcities, and woredas."}
            {isCityRole && "Manage subcities under your city."}
            {isSubcityRole && "Manage woredas under your subcity."}
          </p>
        </div>
        {canCreateOnTab(activeTab) && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add {getTabLabel(activeTab).slice(0, -1)}
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {availableTabs.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
          >
            {getTabIcon(tab)}
            <span className="ml-2">{getTabLabel(tab)}</span>
          </Button>
        ))}
      </div>

      <div className="bg-white rounded border border-slate-100 shadow-sm overflow-hidden">
        <ReusableTable
          data={currentItems}
          columns={tabColumns[activeTab]}
          getRowKey={(row: any) => row.id}
          isLoading={loading}
          emptyText={loading ? `Loading ${getTabLabel(activeTab).toLowerCase()}...` : `No ${getTabLabel(activeTab).toLowerCase()} found`}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. Bole"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Code <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. BOLE-01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Description</Label>
              <Input
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {!editItem && activeTab === "subcities" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Parent City <span className="text-red-500">*</span></Label>
                <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                  <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                  <SelectContent>
                    {cities.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!editItem && activeTab === "woredas" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Parent Subcity <span className="text-red-500">*</span></Label>
                <Select value={selectedSubcityId} onValueChange={setSelectedSubcityId}>
                  <SelectTrigger><SelectValue placeholder="Select Subcity" /></SelectTrigger>
                  <SelectContent>
                    {subcities.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Location
              </Label>
              <MapPicker
                lat={latitude ? Number(latitude) : undefined}
                lng={longitude ? Number(longitude) : undefined}
                onChange={(lat, lng) => {
                  setLatitude(String(lat));
                  setLongitude(String(lng));
                }}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm font-bold text-slate-700">Active</Label>
                <p className="text-xs text-muted-foreground">Enable or disable this unit</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave}>{editItem ? "Save Changes" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Item"
        description="Delete this item? This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={confirmLoading}
        onConfirm={executeDelete}
      />
    </div>
  );
}
