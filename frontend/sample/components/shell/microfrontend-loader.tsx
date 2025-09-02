"use client"

import type React from "react"

import { Suspense, lazy, type ComponentType } from "react"
import { getMicrofrontendById } from "@/lib/microfrontend-registry"

interface MicrofrontendLoaderProps {
  appId: string
  fallback?: React.ReactNode
}

export function MicrofrontendLoader({ appId, fallback }: MicrofrontendLoaderProps) {
  const microfrontend = getMicrofrontendById(appId)

  if (!microfrontend) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-600">The requested application "{appId}" could not be loaded.</p>
        </div>
      </div>
    )
  }

  const LazyComponent = lazy(microfrontend.component as () => Promise<{ default: ComponentType<any> }>)

  return (
    <Suspense
      fallback={
        fallback || (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading {microfrontend.name}...</p>
            </div>
          </div>
        )
      }
    >
      <LazyComponent />
    </Suspense>
  )
}
