"use client";

import { useEffect, useState } from "react";
import { User, UserRole, ROLE_LABELS } from "@/lib/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionSelector } from "./permission-selector";
import {
  User as UserIcon,
  Shield,
  Upload,
  X,
  Loader2,
  ChevronRight,
  MapPin,
  Navigation,
  Building2,
  Lock,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { getImageUrl, cn } from "@/lib/utils";

import {
  PERMISSION_CATEGORIES,
  DEFAULT_PERMISSIONS_BY_ROLE,
} from "@/lib/permissions";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchCities,
  fetchSubcities,
  fetchWoredas,
  selectCities,
  selectSubcities,
  selectWoredas,
} from "@/lib/store/geoSlice";

type Props = {
  onOpenChange: (open: boolean) => void;
  onSave: (data: FormData) => void;
  initialData?: Partial<User>;
  isNew?: boolean;
  isLoading?: boolean;
  defaultRole?: string;
};

export function UserForm({
  onOpenChange,
  onSave,
  initialData,
  isNew = true,
  isLoading = false,
  defaultRole,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>((defaultRole as UserRole) || UserRole.SYSTEM_ADMIN);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [officeAddress, setOfficeAddress] = useState("");
  const [officeLatitude, setOfficeLatitude] = useState("");
  const [officeLongitude, setOfficeLongitude] = useState("");
  const [assignedArea, setAssignedArea] = useState("");
  const [subCity, setSubCity] = useState("");

  const [cityId, setCityId] = useState("");
  const [subcityId, setSubcityId] = useState("");
  const [woredaId, setWoredaId] = useState("");

  const geoDispatch = useAppDispatch();
  const cities = useAppSelector(selectCities);
  const subcities = useAppSelector(selectSubcities);
  const woredas = useAppSelector(selectWoredas);

  useEffect(() => {
    geoDispatch(fetchCities());
    geoDispatch(fetchSubcities());
    geoDispatch(fetchWoredas());
  }, [geoDispatch]);

  const isPatrol = role === UserRole.PATROL;
  const isGeoRole = [
    UserRole.PEACE_SUPER_ADMIN,
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.PEACE_OFFICER_WOREDA,
    UserRole.POLICE_COMMANDER_CITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.POLICE_COMMANDER_WOREDA,
    UserRole.PEACE_SUPER_ADMIN_VIEWER,
    UserRole.PEACE_OFFICER_SUBCITY_VIEWER,
    UserRole.PEACE_OFFICER_WOREDA_VIEWER,
    UserRole.POLICE_COMMANDER_CITY_VIEWER,
    UserRole.POLICE_COMMANDER_SUBCITY_VIEWER,
    UserRole.POLICE_COMMANDER_WOREDA_VIEWER,
  ].includes(role);

  const isSubcityRole = [
    UserRole.PEACE_OFFICER_SUBCITY,
    UserRole.POLICE_COMMANDER_SUBCITY,
    UserRole.PEACE_OFFICER_SUBCITY_VIEWER,
    UserRole.POLICE_COMMANDER_SUBCITY_VIEWER,
  ].includes(role);

  const isWoredaRole = [UserRole.PEACE_OFFICER_WOREDA, UserRole.PEACE_OFFICER_WOREDA_VIEWER, UserRole.POLICE_COMMANDER_WOREDA_VIEWER].includes(role);

  const showWoreda = isWoredaRole;

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName || "");
      setEmail(initialData.email || "");
      const rawPhone = initialData.phoneNumber || "";
      setPhoneNumber(rawPhone.startsWith("+251") ? rawPhone.slice(4) : rawPhone.replace(/^\+?\d{1,3}/, ""));
      setRole((initialData.role as UserRole) || UserRole.SYSTEM_ADMIN);
      setOfficeAddress((initialData as any).officeAddress || "");
      setOfficeLatitude(String((initialData as any).officeLatitude || ""));
      setOfficeLongitude(String((initialData as any).officeLongitude || ""));
      setAssignedArea((initialData as any).assignedArea || "");
      setSubCity((initialData as any).subCity || "");
      setCityId((initialData as any).cityId || "");
      setSubcityId((initialData as any).subcityId || "");
      setWoredaId((initialData as any).woredaId || "");
      if (
        initialData.profileImage &&
        typeof initialData.profileImage === "string"
      ) {
        setPreview(initialData.profileImage);
      }
      if (initialData.permissions && Array.isArray(initialData.permissions)) {
        setPermissions(initialData.permissions);
      }
    } else {
      setPermissions(DEFAULT_PERMISSIONS_BY_ROLE[role] || []);
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData && role) {
      setPermissions(DEFAULT_PERMISSIONS_BY_ROLE[role] || []);
    }
  }, [role, initialData]);

  useEffect(() => {
    if (!profileImage) return;
    const url = URL.createObjectURL(profileImage);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!isPatrol && !email.trim()) newErrors.email = "Email is required";
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{9}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Must be exactly 9 digits";
    } else if (!phoneNumber.startsWith("9")) {
      newErrors.phoneNumber = "Ethiopian mobile numbers start with 9";
    }

    if (isNew && !isPatrol) {
      if (!password.trim()) {
        newErrors.password = "Password is required";
      } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    if (isPatrol) {
      if (officeLatitude && String(officeLatitude).trim()) {
        const lat = Number(officeLatitude);
        if (isNaN(lat)) newErrors.officeLatitude = "Latitude must be a number";
        else if (lat < -90 || lat > 90) newErrors.officeLatitude = "Latitude must be between -90 and 90";
      }
      if (officeLongitude && String(officeLongitude).trim()) {
        const lon = Number(officeLongitude);
        if (isNaN(lon)) newErrors.officeLongitude = "Longitude must be a number";
        else if (lon < -180 || lon > 180) newErrors.officeLongitude = "Longitude must be between -180 and 180";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", fullName);
    if (email.trim()) formData.append("email", email);

    formData.append("phoneNumber", `+251${phoneNumber.trim()}`);

    formData.append("role", role);
    formData.append("isStaffUser", isPatrol ? "false" : "true");

    if (isNew && !isPatrol && password.trim()) {
      formData.append("password", password);
    }

    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    if (isPatrol) {
      if (officeAddress.trim()) formData.append("officeAddress", officeAddress.trim());
      if (officeLatitude.trim()) formData.append("officeLatitude", officeLatitude.trim());
      if (officeLongitude.trim()) formData.append("officeLongitude", officeLongitude.trim());
      if (assignedArea.trim()) formData.append("assignedArea", assignedArea.trim());
      if (subCity.trim()) formData.append("subCity", subCity.trim());
    }

    if (!isPatrol && permissions.length > 0) {
      permissions.forEach((p) => formData.append("permissions", p));
    }

    if (isGeoRole) {
      if (cityId) formData.append("cityId", cityId);
      if (subcityId) formData.append("subcityId", subcityId);
      if (woredaId) formData.append("woredaId", woredaId);
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isNew
                ? (defaultRole ? ROLE_LABELS[defaultRole] || "Create User" : "Create System User")
                : (isPatrol ? "Update Patrol Officer" : "Update User Account")}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isPatrol
                ? "Register a new officer for field operations"
                : defaultRole
                  ? `Set up account for a new ${ROLE_LABELS[defaultRole] || "user"}`
                  : "Manage staff access and permissions for the dashboard"}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5 text-slate-400" />
              Profile Photo
            </Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden relative group cursor-pointer hover:border-[#0d2d82] transition-all">
                {preview ? (
                  <img src={getImageUrl(preview)} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-6 w-6 m-auto mt-4 text-slate-300" />
                )}
                <label htmlFor="profileImage" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="h-4 w-4 text-white" />
                </label>
              </div>
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => document.getElementById("profileImage")?.click()}
                  className="text-xs font-bold text-[#0d2d82] hover:underline"
                >
                  Upload Photo
                </button>
                <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG (Max 2MB)</span>
              </div>
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-bold text-slate-600">Full Name <span className="text-red-500">*</span></Label>
              <Input
                className={cn(
                  "h-10 rounded-lg border-slate-200",
                  errors.fullName && "border-red-500 focus-visible:ring-red-100"
                )}
                placeholder="e.g. Tigist Bekele"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: "" });
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Email Address {!isPatrol && <span className="text-red-500">*</span>}</Label>
              <Input
                type="email"
                className={cn(
                  "h-10 rounded-lg border-slate-200",
                  errors.email && "border-red-500 focus-visible:ring-red-100"
                )}
                placeholder="user@aapsboz.gov.et"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Phone Number <span className="text-red-500">*</span></Label>
              <div className="flex">
                <div className="flex items-center h-10 px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-100 text-sm font-bold text-slate-600 select-none">
                  +251
                </div>
                <Input
                  className={cn(
                    "h-10 rounded-r-lg border-slate-200 rounded-l-none flex-1",
                    errors.phoneNumber && "border-red-500 focus-visible:ring-red-100"
                  )}
                  placeholder="9XXXXXXXX"
                  maxLength={9}
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 9);
                    setPhoneNumber(val);
                    if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: "" });
                  }}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-[11px] text-red-500 font-medium">{errors.phoneNumber}</p>
              )}
            </div>

            {!defaultRole && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Role <span className="text-red-500">*</span></Label>
                <Select value={role} onValueChange={(v) => {
                  setRole(v as UserRole);
                  setCityId("");
                  setSubcityId("");
                  setWoredaId("");
                }}>
                  <SelectTrigger className="h-10 rounded-lg border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SYSTEM_SUPER_ADMIN">System Super Admin</SelectItem>
                    <SelectItem value="SYSTEM_ADMIN">System Admin</SelectItem>
                    <SelectItem value="PEACE_SUPER_ADMIN">Peace Super Admin</SelectItem>
                    <SelectItem value="PEACE_OFFICER_SUBCITY">Peace Officer Subcity</SelectItem>
                    <SelectItem value="PEACE_OFFICER_WOREDA">Peace Officer Woreda</SelectItem>
                    <SelectItem value="POLICE_COMMANDER_CITY">Police Commander City</SelectItem>
                    <SelectItem value="POLICE_COMMANDER_SUBCITY">Police Commander Subcity</SelectItem>
                    <SelectItem value="POLICE_COMMANDER_WOREDA">Police Commander Woreda</SelectItem>
                    <SelectItem value="SYSTEM_SUPER_ADMIN_VIEWER">Super Admin Viewer</SelectItem>
                    <SelectItem value="SYSTEM_ADMIN_VIEWER">Admin Viewer</SelectItem>
                    <SelectItem value="PEACE_SUPER_ADMIN_VIEWER">Peace Super Admin Viewer</SelectItem>
                    <SelectItem value="PEACE_OFFICER_SUBCITY_VIEWER">Peace Subcity Viewer</SelectItem>
                    <SelectItem value="PEACE_OFFICER_WOREDA_VIEWER">Peace Woreda Viewer</SelectItem>
                    <SelectItem value="POLICE_COMMANDER_CITY_VIEWER">Police City Viewer</SelectItem>
                    <SelectItem value="POLICE_COMMANDER_SUBCITY_VIEWER">Police Subcity Viewer</SelectItem>
                    <SelectItem value="POLICE_COMMANDER_WOREDA_VIEWER">Police Woreda Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isNew && !isPatrol && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="password"
                  className={cn(
                    "h-10 rounded-lg border-slate-200",
                    errors.password && "border-red-500 focus-visible:ring-red-100"
                  )}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                />
                {errors.password && (
                  <p className="text-[11px] text-red-500 font-medium">{errors.password}</p>
                )}
              </div>
            )}

            {isGeoRole && (
              <div className="sm:col-span-2 space-y-3 pt-2 border-t border-slate-100">
                <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  Geographic Assignment
                </Label>
                <div className={`grid grid-cols-1 gap-3 ${showWoreda ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                   <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold text-slate-500">City</Label>
                     <Select value={cityId} onValueChange={setCityId}>
                       <SelectTrigger className="h-10 rounded-lg border-slate-200">
                         <SelectValue placeholder="Select city" />
                       </SelectTrigger>
                       <SelectContent>
                         {cities.map((c: any) => (
                           <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-1.5">
                     <Label className="text-[10px] font-bold text-slate-500">Subcity</Label>
                     <Select value={subcityId} onValueChange={setSubcityId}>
                       <SelectTrigger className="h-10 rounded-lg border-slate-200">
                         <SelectValue placeholder="Select subcity" />
                       </SelectTrigger>
                       <SelectContent>
                         {subcities
                           .filter((s: any) => !cityId || s.cityId === cityId)
                           .map((s: any) => (
                             <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                           ))}
                       </SelectContent>
                     </Select>
                   </div>
                   {showWoreda && (
                     <div className="space-y-1.5">
                       <Label className="text-[10px] font-bold text-slate-500">Woreda</Label>
                       <Select value={woredaId} onValueChange={setWoredaId}>
                         <SelectTrigger className="h-10 rounded-lg border-slate-200">
                           <SelectValue placeholder="Select woreda" />
                         </SelectTrigger>
                         <SelectContent>
                           {woredas
                             .filter((w: any) => !subcityId || w.subcityId === subcityId)
                             .map((w: any) => (
                               <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                             ))}
                         </SelectContent>
                       </Select>
                     </div>
                   )}
                 </div>
                <p className="text-[10px] text-slate-400">Assign this officer to a specific geographic area.</p>
              </div>
            )}

            {isPatrol && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Sub-City <span className="text-red-500">*</span>
                  </Label>
                  <Select value={subCity} onValueChange={setSubCity}>
                    <SelectTrigger className="h-10 rounded-lg border-slate-200">
                      <SelectValue placeholder="Select sub-city" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Bole", "Arada", "Kirkos", "Yeka", "Addis Ketema", "Lideta", "Nifas Silk Lafto", "Kolfe Keranio", "Gulele", "Akaki Kality", "Lemi Kura"].map((sc) => (
                        <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    Station Address
                  </Label>
                  <Input
                    className="h-10 rounded-lg border-slate-200"
                    placeholder="e.g. Bole Sub-City Division"
                    value={officeAddress}
                    onChange={(e) => setOfficeAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Navigation className="h-3.5 w-3.5 text-slate-400" />
                    Coordinates (Lat, Long)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      className="h-10 rounded-lg border-slate-200 flex-1 text-xs"
                      placeholder="Lat: 9.0"
                      value={officeLatitude}
                      onChange={(e) => setOfficeLatitude(e.target.value)}
                    />
                    <Input
                      className="h-10 rounded-lg border-slate-200 flex-1 text-xs"
                      placeholder="Long: 38.0"
                      value={officeLongitude}
                      onChange={(e) => setOfficeLongitude(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {!isPatrol && !isSubcityRole && (
              <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-100">
                <Label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  Dashboard Access Permissions
                </Label>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-1">
                  <PermissionSelector
                    permissions={permissions}
                    onPermissionsChange={setPermissions}
                    categories={PERMISSION_CATEGORIES}
                    placeholder="Assign Permissions"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-5 py-2 bg-[#0d2d82] hover:opacity-95 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
          >
            {isLoading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                {isNew
                  ? (isPatrol
                      ? "Register Officer"
                      : defaultRole
                        ? `Create ${ROLE_LABELS[defaultRole] || "User"}`
                        : "Create Account")
                  : "Save Changes"}
                <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
