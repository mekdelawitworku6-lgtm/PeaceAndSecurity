"use client";

import type React from "react";
import { Sidebar } from "@/components/layouts/sidebar";
import { DashboardHeader } from "@/components/layouts/dashboard-header";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#f3f7fa] p-4 gap-4 overflow-hidden">
        {/* Desktop Sidebar Panel */}
        <div className="hidden md:flex flex-col h-full shrink-0">
          <Sidebar />
        </div>

        {/* Main Content Panel — same card style as sidebar */}
        <div className="flex-1 flex flex-col overflow-hidden h-full bg-white rounded-2xl shadow-sm border border-slate-100">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
