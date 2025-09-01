"use client"

import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from "react"

interface SharedState {
  notifications: Array<{
    id: string
    type: "success" | "error" | "warning" | "info"
    message: string
    title?: string
    timestamp: number
  }>
  selectedUsers: string[]
  globalFilters: {
    dateRange?: { start: Date; end: Date }
    department?: string
    status?: string
  }
  crossAppData: Record<string, any>
}

type SharedStateAction =
  | { type: "ADD_NOTIFICATION"; payload: Omit<SharedState["notifications"][0], "id" | "timestamp"> }
  | { type: "REMOVE_NOTIFICATION"; payload: { id: string } }
  | { type: "SET_SELECTED_USERS"; payload: { userIds: string[] } }
  | { type: "SET_GLOBAL_FILTER"; payload: { key: keyof SharedState["globalFilters"]; value: any } }
  | { type: "SET_CROSS_APP_DATA"; payload: { key: string; data: any } }
  | { type: "CLEAR_CROSS_APP_DATA"; payload: { key: string } }

const initialState: SharedState = {
  notifications: [],
  selectedUsers: [],
  globalFilters: {},
  crossAppData: {},
}

function sharedStateReducer(state: SharedState, action: SharedStateAction): SharedState {
  switch (action.type) {
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            ...action.payload,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
          },
        ],
      }
    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload.id),
      }
    case "SET_SELECTED_USERS":
      return {
        ...state,
        selectedUsers: action.payload.userIds,
      }
    case "SET_GLOBAL_FILTER":
      return {
        ...state,
        globalFilters: {
          ...state.globalFilters,
          [action.payload.key]: action.payload.value,
        },
      }
    case "SET_CROSS_APP_DATA":
      return {
        ...state,
        crossAppData: {
          ...state.crossAppData,
          [action.payload.key]: action.payload.data,
        },
      }
    case "CLEAR_CROSS_APP_DATA":
      const { [action.payload.key]: _, ...rest } = state.crossAppData
      return {
        ...state,
        crossAppData: rest,
      }
    default:
      return state
  }
}

const SharedStateContext = createContext<
  | {
      state: SharedState
      dispatch: Dispatch<SharedStateAction>
    }
  | undefined
>(undefined)

interface SharedStateProviderProps {
  children: ReactNode
}

export function SharedStateProvider({ children }: SharedStateProviderProps) {
  const [state, dispatch] = useReducer(sharedStateReducer, initialState)

  return <SharedStateContext.Provider value={{ state, dispatch }}>{children}</SharedStateContext.Provider>
}

export function useSharedState() {
  const context = useContext(SharedStateContext)
  if (context === undefined) {
    throw new Error("useSharedState must be used within a SharedStateProvider")
  }
  return context
}
