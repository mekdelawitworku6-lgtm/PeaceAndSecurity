import type React from "react";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peace & Security | Admin Dashboard",
  description: "Advanced peace and security monitoring system",
  generator: "peace-and-security.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Peace & Security",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#00875a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ClientProviders } from "@/components/providers/client-providers";
import { PWARegistration } from "@/components/pwa-registration"; // Import

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans antialiased text-foreground bg-background"
        suppressHydrationWarning
      >
        {/* <PWARegistration /> */}
        <ClientProviders>
          {children}
          {/* <Analytics /> */}
        </ClientProviders>
      </body>
    </html>
  );
}
