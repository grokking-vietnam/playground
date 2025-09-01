"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ShellLayout } from "@/components/shell/shell-layout"
import { MicrofrontendLoader } from "@/components/shell/microfrontend-loader"

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentApp, setCurrentApp] = useState(searchParams.get("app") || "bigquery")

  const handleNavigate = (appId: string) => {
    setCurrentApp(appId)
    const newUrl = appId === "bigquery" ? "/" : `/?app=${appId}`
    window.history.pushState({}, "", newUrl)
  }

  return (
    <ShellLayout currentApp={currentApp} onNavigate={handleNavigate}>
      <MicrofrontendLoader appId={currentApp} />
    </ShellLayout>
  )
}
