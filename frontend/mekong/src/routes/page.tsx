import React, { useState, useEffect } from "react"
import { useSearchParams } from "@modern-js/runtime/router"
import { ShellLayout } from "@/components/shell/shell-layout"
import { MicrofrontendLoader } from "@/components/shell/microfrontend-loader"

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentApp, setCurrentApp] = useState("home")

  // Initialize current app from URL params
  useEffect(() => {
    const appParam = searchParams.get("app")
    if (appParam) {
      setCurrentApp(appParam)
    }
  }, [searchParams])

  const handleNavigate = (appId: string) => {
    setCurrentApp(appId)
    const newParams = new URLSearchParams(searchParams)
    if (appId === "home") {
      newParams.delete("app")
    } else {
      newParams.set("app", appId)
    }
    setSearchParams(newParams)
  }

  return (
    <ShellLayout currentApp={currentApp} onNavigate={handleNavigate}>
      <MicrofrontendLoader appId={currentApp} />
    </ShellLayout>
  )
}