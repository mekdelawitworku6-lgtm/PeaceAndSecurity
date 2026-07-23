
"use client";

import { useAuth } from "@/app/context/auth-context";
import { PERMISSIONS } from "@/lib/permissions";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Settings,
  BarChart3,
  Users,
  LogOut,
  FileText,
  MapPin,
  Shield,
  MessageSquare,
  ClipboardList,
} from "lucide-react";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
    permission: PERMISSIONS.DASHBOARD_VIEW,
    exact: true,
  },
  {
    label: "Reports Management",
    href: "/dashboard/reports",
    icon: FileText,
    permission: PERMISSIONS.REPORT_VIEW,
  },
  {
    label: "Officers",
    href: "/dashboard/patrols",
    icon: Users,
    permission: PERMISSIONS.USER_VIEW,
  },
  {
    label: "Geographic Units",
    href: "/dashboard/geo",
    icon: MapPin,
    permission: PERMISSIONS.GEO_MANAGE,
  },
  {
    label: "Patrol Teams",
    href: "/dashboard/patrol-teams",
    icon: Shield,
    permission: PERMISSIONS.PATROL_TEAM_MANAGE,
  },
  {
    label: "Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
    permission: PERMISSIONS.CHAT_VIEW,
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit-logs",
    icon: ClipboardList,
    permission: PERMISSIONS.AUDIT_LOG_VIEW,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
];

interface SidebarProps {
  onItemClick?: () => void;
}

export function Sidebar({ onItemClick }: SidebarProps) {
  const { user, logout, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const filteredItems = navigationItems.filter((item) => {
    return hasPermission(item.permission);
  });

  return (
    <div className="w-full md:w-64 bg-white flex flex-col h-full rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center justify-center py-6 px-6">
        <Link
          href="/dashboard"
          className="flex items-center justify-center group"
        >
          <img
            src="/login-brand.png"
            alt="Peace & Security Logo"
            className="w-14 h-14 object-contain transition-transform group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Navigation — each item is its own card */}
      <nav className="flex-1 px-3 pb-4 space-y-2 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = (item.href === "/dashboard")
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <button
                onClick={() => {
                  onItemClick?.();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all text-left border",
                  isActive
                    ? "bg-[#e8ecf4] text-[#0c2340] border-slate-200 shadow-sm"
                    : "bg-white text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600 hover:border-slate-100",
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 shrink-0",
                  isActive ? "text-[#0c2340]" : "text-slate-400",
                )}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                {item.label}
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Logout — full-width red pill card */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-5 py-4 bg-[#b91c1c] text-white hover:bg-[#991b1b] rounded-2xl transition-all font-semibold text-[15px] shadow-md shadow-red-900/15 border border-red-800/20"
        >
          <span>Logout</span>
          <LogOut className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
