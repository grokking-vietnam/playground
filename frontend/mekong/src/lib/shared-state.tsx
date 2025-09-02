import React, { createContext, useContext, useReducer, type ReactNode } from "react"

interface SharedState {
  notifications: Array<{
    id: string
    type: "info" | "success" | "warning" | "error"
    title: string
    message: string
    timestamp: number
  }>
  selectedProject: string | null
  theme: "light" | "dark"
  isFloatingNavOpen: boolean
}

type SharedStateAction =
  | { type: "ADD_NOTIFICATION"; payload: Omit<SharedState["notifications"][0], "id" | "timestamp"> }
  | { type: "REMOVE_NOTIFICATION"; payload: string }
  | { type: "SET_SELECTED_PROJECT"; payload: string | null }
  | { type: "TOGGLE_THEME" }
  | { type: "SET_FLOATING_NAV_OPEN"; payload: boolean }

const initialState: SharedState = {
  notifications: [],
  selectedProject: null,
  theme: "light",
  isFloatingNavOpen: false
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
            timestamp: Date.now()
          }
        ]
      }
    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      }
    case "SET_SELECTED_PROJECT":
      return {
        ...state,
        selectedProject: action.payload
      }
    case "TOGGLE_THEME":
      return {
        ...state,
        theme: state.theme === "light" ? "dark" : "light"
      }
    case "SET_FLOATING_NAV_OPEN":
      return {
        ...state,
        isFloatingNavOpen: action.payload
      }
    default:
      return state
  }
}

const SharedStateContext = createContext<{
  state: SharedState
  dispatch: React.Dispatch<SharedStateAction>
} | undefined>(undefined)

export function SharedStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sharedStateReducer, initialState)

  return (
    <SharedStateContext.Provider value={{ state, dispatch }}>
      {children}
    </SharedStateContext.Provider>
  )
}

export function useSharedState() {
  const context = useContext(SharedStateContext)
  if (context === undefined) {
    throw new Error("useSharedState must be used within a SharedStateProvider")
  }
  return context
}

export function useNotifications() {
  const { state, dispatch } = useSharedState()
  
  const addNotification = (notification: Omit<SharedState["notifications"][0], "id" | "timestamp">) => {
    dispatch({ type: "ADD_NOTIFICATION", payload: notification })
  }
  
  const removeNotification = (id: string) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id })
  }
  
  return {
    notifications: state.notifications,
    addNotification,
    removeNotification
  }
}

export function useFloatingNav() {
  const { state, dispatch } = useSharedState()
  
  const setFloatingNavOpen = (isOpen: boolean) => {
    dispatch({ type: "SET_FLOATING_NAV_OPEN", payload: isOpen })
  }
  
  return {
    isFloatingNavOpen: state.isFloatingNavOpen,
    setFloatingNavOpen
  }
}
