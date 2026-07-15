import type React from "react";
import { cn } from "@/lib/utils";

export function AuthLayout({
  children,
  showBranding = true,
}: {
  children: React.ReactNode;
  showBranding?: boolean;
}) {
  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-4 md:p-8 relative bg-slate-900 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 32, 67, 0.6), rgba(27, 47, 69, 0.7)), url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Soft overlay gradient to ensure high text contrast and visual depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/45 via-slate-900/10 to-slate-950/45 z-0" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[680px] bg-white rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] p-8 md:p-14 transition-all duration-300">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
