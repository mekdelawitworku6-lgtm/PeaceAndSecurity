"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context";
import { PERMISSIONS } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Plus,
  Pencil,
  Trash2,
  X,
  Shield,
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

// ─── Tab Types ───────────────────────────────────────────────────────────────
type SettingsTab = "general" | "team" | "categories";

// ─── Mock Data (will be replaced with backend integration) ───────────────────
const MOCK_TEAM: TeamMember[] = [
  { id: "1", fullName: "Abebe Tadesse", email: "abebe@aapbs.gov.et", role: "Super Admin", color: "bg-red-500" },
  { id: "2", fullName: "Hanan Alemayehu", email: "hanan.a@aapbs.gov.et", role: "Dispatcher", color: "bg-green-500" },
  { id: "3", fullName: "Hanna Tesfa", email: "hanna.t@aapbs.gov.et", role: "Dispatcher", color: "bg-blue-500" },
  { id: "4", fullName: "Girma Haile", email: "girma.h@aapbs.gov.et", role: "Sub City Manager", color: "bg-purple-500" },
  { id: "5", fullName: "Senait Wolde", email: "senait.w@aapbs.gov.et", role: "Viewer", color: "bg-orange-500" },
];

const DEFAULT_CATEGORIES: IncidentCategory[] = [
  { id: "1", name: "Robbery/Theft", icon: "💰", bg: "bg-rose-100", enabled: true },
  { id: "2", name: "Illegal Weapons", icon: "🔫", bg: "bg-amber-100", enabled: true },
  { id: "3", name: "Property/Fraud", icon: "👤", bg: "bg-purple-100", enabled: true },
  { id: "4", name: "Security Threat", icon: "💡", bg: "bg-slate-100", enabled: true },
  { id: "5", name: "Street Begging", icon: "🎪", bg: "bg-blue-100", enabled: true },
  { id: "6", name: "Disruptive Activity", icon: "🔊", bg: "bg-fuchsia-100", enabled: true },
  { id: "7", name: "Unfit Area", icon: "🏚️", bg: "bg-orange-100", enabled: true },
  { id: "8", name: "Illegal Business", icon: "🏪", bg: "bg-teal-100", enabled: true },
  { id: "9", name: "Event Security", icon: "⚠️", bg: "bg-red-100", enabled: true },
  { id: "10", name: "Institution Inspection", icon: "🏛️", bg: "bg-cyan-100", enabled: true },
];

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: string;
  color: string;
}

interface IncidentCategory {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  bg?: string;
}

// ═════════════════════════════════════════════════════════════════════════════
//  GENERAL SETTINGS TAB
// ═════════════════════════════════════════════════════════════════════════════
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
    // TODO: integrate with backend
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
          <Input
            value={bureauName}
            onChange={(e) => setBureauName(e.target.value)}
            className="h-11 rounded-lg border-slate-200 bg-slate-50/50 font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bureau Code</Label>
          <Input
            value={bureauCode}
            onChange={(e) => setBureauCode(e.target.value)}
            className="h-11 rounded-lg border-slate-200 bg-slate-50/50 font-medium w-48"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="h-11 rounded-lg border-slate-200 bg-slate-50/50 font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EAT">East Africa Time (EAT) — UTC+3</SelectItem>
              <SelectItem value="UTC">UTC — Coordinated Universal Time</SelectItem>
              <SelectItem value="CET">Central European Time — UTC+1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Default Priority Thresholds
          </Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">High Priority Hours</span>
              <Input
                type="number"
                value={highPriority}
                onChange={(e) => setHighPriority(e.target.value)}
                className="h-11 rounded-lg border-slate-200 bg-slate-50/50 font-medium"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Medium Priority Bound</span>
              <Input
                type="number"
                value={mediumPriority}
                onChange={(e) => setMediumPriority(e.target.value)}
                className="h-11 rounded-lg border-slate-200 bg-slate-50/50 font-medium"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Low Priority Above</span>
              <Input
                type="number"
                value={lowPriority}
                onChange={(e) => setLowPriority(e.target.value)}
                className="h-11 rounded-lg border-slate-200 bg-slate-50/50 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="h-11 rounded-lg px-6 bg-primary hover:opacity-90 text-white font-bold text-sm shadow-sm"
      >
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  TEAM & ROLES TAB
// ═════════════════════════════════════════════════════════════════════════════
function TeamRolesTab() {
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    fullName: "",
    email: "",
    role: "Dispatcher",
    subCity: "",
  });
  const [sending, setSending] = useState(false);

  const handleInvite = async () => {
    if (!inviteForm.fullName || !inviteForm.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSending(true);
    // TODO: integrate with backend
    await new Promise((r) => setTimeout(r, 800));
    const newMember: TeamMember = {
      id: Date.now().toString(),
      fullName: inviteForm.fullName,
      email: inviteForm.email,
      role: inviteForm.role,
      color: "bg-teal-500",
    };
    setTeam((prev) => [...prev, newMember]);
    setShowInvite(false);
    setInviteForm({ fullName: "", email: "", role: "Dispatcher", subCity: "" });
    toast.success("Invitation sent successfully");
    setSending(false);
  };

  const handleDelete = (id: string) => {
    setTeam((prev) => prev.filter((m) => m.id !== id));
    toast.success("Team member removed");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Super Admin": return "bg-red-50 text-red-600 border-red-100";
      case "Dispatcher": return "bg-blue-50 text-blue-600 border-blue-100";
      case "Sub City Manager": return "bg-rose-50 text-rose-600 border-rose-100";
      case "Viewer": return "bg-slate-50 text-slate-600 border-slate-100";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Team Members</h2>
        <Button
          onClick={() => setShowInvite(true)}
          className="h-10 rounded-lg px-5 bg-primary hover:opacity-90 text-white font-bold text-sm shadow-sm"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Team Table */}
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
            {team.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold", member.color)}>
                      {member.fullName.charAt(0)}
                    </div>
                    <span className="font-semibold text-sm text-slate-800">{member.fullName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-medium">{member.email}</td>
                <td className="px-6 py-4">
                  <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-bold border", getRoleBadgeColor(member.role))}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="text-xs font-bold text-primary hover:underline">Edit</button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-0 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Invite New User</h3>
                  <p className="text-xs text-slate-400 mt-0.5">They will receive an email to set up their account.</p>
                </div>
                <button onClick={() => setShowInvite(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={inviteForm.fullName}
                    onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                    placeholder="e.g. Tigist Bekele"
                    className="h-11 rounded-lg border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Email Address <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="user@aapsboz.gov.et"
                    className="h-11 rounded-lg border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Role <span className="text-red-500">*</span></Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(v) => setInviteForm({ ...inviteForm, role: v })}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dispatcher">Dispatcher</SelectItem>
                      <SelectItem value="Sub City Manager">Sub City Manager</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Sub-City Assignment</Label>
                  <Select
                    value={inviteForm.subCity}
                    onValueChange={(v) => setInviteForm({ ...inviteForm, subCity: v })}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-slate-200">
                      <SelectValue placeholder="All sub-cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sub-cities</SelectItem>
                      <SelectItem value="bole">Bole</SelectItem>
                      <SelectItem value="kirkos">Kirkos</SelectItem>
                      <SelectItem value="arada">Arada</SelectItem>
                      <SelectItem value="yeka">Yeka</SelectItem>
                      <SelectItem value="addis-ketema">Addis Ketema</SelectItem>
                      <SelectItem value="lideta">Lideta</SelectItem>
                      <SelectItem value="nifas-silk">Nifas Silk Lafto</SelectItem>
                      <SelectItem value="kolfe">Kolfe Keranio</SelectItem>
                      <SelectItem value="gulele">Gulele</SelectItem>
                      <SelectItem value="akaki">Akaki Kality</SelectItem>
                      <SelectItem value="lemi-kura">Lemi Kura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  Assign/reassign reports, change statuses, view all data across sub-cities.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <Button
                onClick={handleInvite}
                disabled={sending}
                className="h-11 rounded-lg px-6 bg-primary hover:opacity-90 text-white font-bold text-sm"
              >
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send Invitation
              </Button>
              <Button variant="ghost" onClick={() => setShowInvite(false)} className="h-11 rounded-lg font-bold text-sm text-slate-500">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  INCIDENT CATEGORIES TAB
// ═════════════════════════════════════════════════════════════════════════════
function IncidentCategoriesTab() {
  const [categories, setCategories] = useState<IncidentCategory[]>(DEFAULT_CATEGORIES);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "🔒" });
  const [saving, setSaving] = useState(false);

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast.error("Category name is required");
      return;
    }
    const cat: IncidentCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      icon: newCategory.icon,
      enabled: true,
    };
    setCategories((prev) => [...prev, cat]);
    setShowAdd(false);
    setNewCategory({ name: "", icon: "🔒" });
    toast.success("Category added");
  };

  const handleSaveCategories = async () => {
    setSaving(true);
    // TODO: integrate with backend
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Category settings saved");
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Incident Categories</h2>
        <Button
          onClick={() => setShowAdd(true)}
          className="h-10 rounded-lg px-5 bg-primary hover:opacity-90 text-white font-bold text-sm shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm", cat.bg || "bg-primary/10")}>
                {cat.icon}
              </div>
              <span className="font-bold text-sm text-slate-800">{cat.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-xs font-bold text-primary hover:underline">Edit</button>
              {/* Checkbox toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cat.enabled}
                  onChange={() => toggleCategory(cat.id)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-colors">
                  {cat.enabled && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </label>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleSaveCategories}
        disabled={saving}
        className="h-11 rounded-lg px-6 bg-primary hover:opacity-90 text-white font-bold text-sm shadow-sm"
      >
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Save Category Settings
      </Button>

      {/* Add Category Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add New Category</h3>
                </div>
                <button onClick={() => setShowAdd(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g. Robbery"
                  className="h-11 rounded-lg border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-600">Add Icon</Label>
                <Select value={newCategory.icon} onValueChange={(v) => setNewCategory({ ...newCategory, icon: v })}>
                  <SelectTrigger className="h-11 rounded-lg border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="🔒">🔒 Lock</SelectItem>
                    <SelectItem value="🔓">🔓 Unlock</SelectItem>
                    <SelectItem value="⚠️">⚠️ Warning</SelectItem>
                    <SelectItem value="🔫">🔫 Weapon</SelectItem>
                    <SelectItem value="📋">📋 Clipboard</SelectItem>
                    <SelectItem value="🔊">🔊 Loud</SelectItem>
                    <SelectItem value="🏚️">🏚️ Building</SelectItem>
                    <SelectItem value="🏪">🏪 Store</SelectItem>
                    <SelectItem value="🎪">🎪 Event</SelectItem>
                    <SelectItem value="🏛️">🏛️ Institution</SelectItem>
                    <SelectItem value="🙏">🙏 Prayer</SelectItem>
                    <SelectItem value="🚨">🚨 Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <Button
                onClick={handleAddCategory}
                className="h-11 rounded-lg px-6 bg-primary hover:opacity-90 text-white font-bold text-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
              <Button variant="ghost" onClick={() => setShowAdd(false)} className="h-11 rounded-lg font-bold text-sm text-slate-500">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN SETTINGS PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  if (!hasPermission(PERMISSIONS.SETTINGS_VIEW)) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Access Denied: Missing SETTINGS_VIEW permission
      </div>
    );
  }

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: "general", label: "General" },
    { key: "team", label: "Team & Roles" },
    { key: "categories", label: "Incident Categories" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl">
      <PageHeader title="Settings" description="" className="w-full!" />

      {/* Tab Bar */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-bold transition-all",
              activeTab === tab.key
                ? "bg-primary text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
        {activeTab === "general" && <GeneralSettingsTab />}
        {activeTab === "team" && <TeamRolesTab />}
        {activeTab === "categories" && <IncidentCategoriesTab />}
      </div>
    </div>
  );
}
