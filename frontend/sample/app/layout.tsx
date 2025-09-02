import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { SharedStateProvider } from "@/lib/shared-state"
import { NotificationSystem } from "@/components/shared/notification-system"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "BigQuery Studio - Microfrontend Platform",
  description: "Enterprise data platform with microfrontend architecture",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <SharedStateProvider>
              {children}
              <NotificationSystem />
            </SharedStateProvider>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
