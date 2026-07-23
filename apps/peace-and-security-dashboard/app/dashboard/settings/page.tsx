"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchUsers, registerUser, toggleUserStatus, selectUsers, selectUsersLoading } from "@/lib/store/usersSlice";
import { PERMISSIONS } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  X,
  Send,
  UserPlus,
} from "lucide-react";
import { PageHeader } from "@/components/layouts/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SettingsTab = "general" | "team";

function GeneralSettingsTab() {
  const [bureauName, setBureauName] = useState("Addis Ababa City Peace and Security Administration Bureau");
  const [bureauCode, setBureauCode] = useState("AAPCB");
  const [timezone, setTimezone] = useState("EAT");
  const [highPriority, setHighPriority] = useState("6");
  const [mediumPriority, setMediumPriority] = useState("12");
  const [lowPriority, setLowPriority] = useState("48");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("General settings saved successfully");
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-bold text-slate-900">General Settings</h2>
      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bureau Name</Label>
          <Input value={bureauName} onChange={(e) => setBureauName(e.target.value)} className="h-11 rounded-lg border-slate-200 bg-slate-50/50 font-medium" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bureau Code</Label>
          <Input value={bureauCode} onChange={(e) => setBureauCode(e.target.value)} className="h-11 rounded-lg border-slate-200 bg-slate-50/50 font-medium w-48" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-slate-50/50 font-medium"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EAT">East Africa Time (EAT) — UTC+3</SelectItem>
              <SelectItem value="UTC">UTC — Coordinated Universal Time</SelectItem>
              <SelectItem value="CET">Central European Time — UTC+1</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Default Priority Thresholds</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">High Priority Hours</span>
              <Input type="number" value={highPriority} onChange={(e) => setHighPriority(e.target.value)} className="h-11 rounded-lg border-slate-200 bg-slate-50/50 font-medium" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Medium Priority Bound</span>
              <Input type="number" value={mediumPriority} onChange={(e) => setMediumPriority(e.target.value)} className="h-11 rounded-lg border-slate-200 bg-slate-50/50 font-medium" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Low Priority Above</span>
              <Input type="number" value={lowPriority} onChange={(e) => setLowPriority(e.target.value)} className="h-11 rounded-lg border-slate-200 bg-slate-50/50 font-medium" />
            </div>
          </div>
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving} className="h-11 rounded-lg px-6 bg-primary hover:opacity-90 text-white font-bold text-sm shadow-sm">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  );
}

function TeamRolesTab() {
  const dispatch = useAppDispatch();
  const team = useAppSelector(selectUsers);
  const loading = useAppSelector(selectUsersLoading);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ fullName: "", email: "", role: "SYSTEM_ADMIN", phoneNumber: "", password: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers({ limit: 50, isStaffUser: true }));
  }, [dispatch]);

  const handleInvite = async () => {
    if (!inviteForm.fullName || !inviteForm.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!inviteForm.password || inviteForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("fullName", inviteForm.fullName);
      formData.append("email", inviteForm.email);
      formData.append("role", inviteForm.role);
      formData.append("password", inviteForm.password);
      if (inviteForm.phoneNumber) formData.append("phoneNumber", inviteForm.phoneNumber);
      await dispatch(registerUser(formData)).unwrap();
      setShowInvite(false);
      setInviteForm({ fullName: "", email: "", role: "SYSTEM_ADMIN", phoneNumber: "", password: "" });
      toast.success("User created successfully");
      dispatch(fetchUsers({ limit: 50, isStaffUser: true }));
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user");
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await dispatch(toggleUserStatus(userId)).unwrap();
      toast.success("User status updated");
      dispatch(fetchUsers({ limit: 50, isStaffUser: true }));
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SYSTEM_SUPER_ADMIN": return "bg-red-50 text-red-600 border-red-100";
      case "SYSTEM_ADMIN": return "bg-blue-50 text-blue-600 border-blue-100";
      case "PATROL": return "bg-rose-50 text-rose-600 border-rose-100";
      case "CITIZEN": return "bg-slate-50 text-slate-600 border-slate-100";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SYSTEM_SUPER_ADMIN": return "Super Admin";
      case "SYSTEM_ADMIN": return "System Admin";
      case "PATROL": return "Patrol Officer";
      case "CITIZEN": return "Citizen";
      default: return role;
    }
  };

  const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-orange-500", "bg-teal-500", "bg-pink-500"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Team Members</h2>
        <Button onClick={() => setShowInvite(true)} className="h-10 rounded-lg px-5 bg-primary hover:opacity-90 text-white font-bold text-sm shadow-sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-6 py-3.5 text-[10px] font-black text-primary uppercase tracking-widest">Name</th>
              <th className="px-6 py-3.5 text-[10px] font-black text-primary uppercase tracking-widest">Email</th>
              <th className="px-6 py-3.5 text-[10px] font-black text-primary uppercase tracking-widest">Role</th>
              <th className="px-6 py-3.5 text-[10px] font-black text-primary uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
            ) : team.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No team members found</td></tr>
            ) : (
              team.map((member: any, idx: number) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold", colors[idx % colors.length])}>
                        {(member.fullName || member.name || "?").charAt(0)}
                      </div>
                      <span className="font-semibold text-sm text-slate-800">{member.fullName || member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">{member.email}</td>
                  <td className="px-6 py-4">
                    <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-bold border", getRoleBadgeColor(member.role))}>
                      {getRoleLabel(member.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(member.id)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        {member.status === "ACTIVE" ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create New User</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Set up account access for a new user.</p>
                </div>
                <button onClick={() => setShowInvite(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Full Name <span className="text-red-500">*</span></Label>
                  <Input value={inviteForm.fullName} onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })} placeholder="e.g. Tigist Bekele" className="h-11 rounded-lg border-slate-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Email Address <span className="text-red-500">*</span></Label>
                  <Input type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="user@aapbs.gov.et" className="h-11 rounded-lg border-slate-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Role <span className="text-red-500">*</span></Label>
                  <Select value={inviteForm.role} onValueChange={(v) => setInviteForm({ ...inviteForm, role: v })}>
                    <SelectTrigger className="h-11 rounded-lg border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SYSTEM_SUPER_ADMIN">System Super Admin</SelectItem>
                      <SelectItem value="SYSTEM_ADMIN">System Admin</SelectItem>
                      <SelectItem value="PEACE_SUPER_ADMIN">Peace Super Admin</SelectItem>
                      <SelectItem value="PEACE_OFFICER_SUBCITY">Peace Officer Subcity</SelectItem>
                      <SelectItem value="PEACE_OFFICER_WOREDA">Peace Officer Woreda</SelectItem>
                      <SelectItem value="POLICE_COMMANDER_CITY">Police Commander City</SelectItem>
                      <SelectItem value="POLICE_COMMANDER_SUBCITY">Police Commander Subcity</SelectItem>
                      <SelectItem value="POLICE_COMMANDER_WOREDA">Police Commander Woreda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Phone Number</Label>
                  <Input value={inviteForm.phoneNumber} onChange={(e) => setInviteForm({ ...inviteForm, phoneNumber: e.target.value })} placeholder="+2519..." className="h-11 rounded-lg border-slate-200" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Password <span className="text-red-500">*</span></Label>
                <Input type="password" value={inviteForm.password} onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })} placeholder="Min. 6 characters" className="h-11 rounded-lg border-slate-200" />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  The user will be created with the provided password and can log in immediately.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <Button onClick={handleInvite} disabled={sending} className="h-11 rounded-lg px-6 bg-primary hover:opacity-90 text-white font-bold text-sm">
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Create User
              </Button>
              <Button variant="ghost" onClick={() => setShowInvite(false)} className="h-11 rounded-lg font-bold text-sm text-slate-500">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  if (!hasPermission(PERMISSIONS.SETTINGS_VIEW)) {
    return <div className="p-6 text-center text-red-500 font-semibold">Access Denied: Missing SETTINGS_VIEW permission</div>;
  }

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: "general", label: "General" },
    { key: "team", label: "Team & Roles" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl">
      <PageHeader title="Settings" description="" className="w-full!" />
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-bold transition-all",
              activeTab === tab.key ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        {activeTab === "general" && <GeneralSettingsTab />}
        {activeTab === "team" && <TeamRolesTab />}
      </div>
    </div>
  );
}
