"use client"

import { useCallback } from "react"
import { eventBus, type EventBusEvents } from "@/lib/event-bus"
import { useSharedState } from "@/lib/shared-state"

export function useMicrofrontendCommunication() {
  const { state, dispatch } = useSharedState()

  // Notification system
  const showNotification = useCallback(
    (type: "success" | "error" | "warning" | "info", message: string, title?: string) => {
      dispatch({
        type: "ADD_NOTIFICATION",
        payload: { type, message, title },
      })

      // Also emit event for other microfrontends
      eventBus.emit("notification:show", { type, message, title })
    },
    [dispatch],
  )

  const removeNotification = useCallback(
    (id: string) => {
      dispatch({
        type: "REMOVE_NOTIFICATION",
        payload: { id },
      })
    },
    [dispatch],
  )

  // Cross-app data sharing
  const setCrossAppData = useCallback(
    (key: string, data: any) => {
      dispatch({
        type: "SET_CROSS_APP_DATA",
        payload: { key, data },
      })
    },
    [dispatch],
  )

  const getCrossAppData = useCallback(
    (key: string) => {
      return state.crossAppData[key]
    },
    [state.crossAppData],
  )

  // Event subscription helper
  const subscribe = useCallback(
    <K extends keyof EventBusEvents>(event: K, callback: (data: EventBusEvents[K]) => void) => {
      return eventBus.subscribe(event, callback)
    },
    [],
  )

  // Event emission helper
  const emit = useCallback(<K extends keyof EventBusEvents>(event: K, data: EventBusEvents[K]) => {
    eventBus.emit(event, data)
  }, [])

  // Global filters
  const setGlobalFilter = useCallback(
    (key: keyof typeof state.globalFilters, value: any) => {
      dispatch({
        type: "SET_GLOBAL_FILTER",
        payload: { key, value },
      })
    },
    [dispatch],
  )

  // Selected users (for bulk operations across apps)
  const setSelectedUsers = useCallback(
    (userIds: string[]) => {
      dispatch({
        type: "SET_SELECTED_USERS",
        payload: { userIds },
      })
    },
    [dispatch],
  )

  return {
    // State
    notifications: state.notifications,
    selectedUsers: state.selectedUsers,
    globalFilters: state.globalFilters,

    // Actions
    showNotification,
    removeNotification,
    setCrossAppData,
    getCrossAppData,
    setGlobalFilter,
    setSelectedUsers,

    // Event system
    subscribe,
    emit,
  }
}
