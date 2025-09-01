import type React from "react"
export interface MicrofrontendConfig {
  id: string
  name: string
  path: string
  component: () => Promise<{ default: React.ComponentType<any> }>
  icon: string
  category: string
}

export const microfrontendRegistry: MicrofrontendConfig[] = [
  {
    id: "bigquery",
    name: "BigQuery Studio",
    path: "/",
    component: () => import("@/apps/bigquery/page"),
    icon: "Database",
    category: "Data & Analytics",
  },
  {
    id: "usermanagement",
    name: "User Management",
    path: "/user-management",
    component: () => import("@/apps/user-management/page"),
    icon: "Users",
    category: "Management",
  },
  {
    id: "permissioncontrol",
    name: "Permission Control",
    path: "/permission-control",
    component: () => import("@/apps/permission-control/page"),
    icon: "Shield",
    category: "Management",
  },
  {
    id: "workflowmanagement",
    name: "Workflow Management",
    path: "/workflow-management",
    component: () => import("@/apps/workflow-management/page"),
    icon: "Workflow",
    category: "Management",
  },
  {
    id: "datacatalog",
    name: "Data Catalog",
    path: "/data-catalog",
    component: () => import("@/apps/data-catalog/page"),
    icon: "GitBranch",
    category: "Data & Analytics",
  },
  {
    id: "vertexai",
    name: "Vertex AI",
    path: "/vertex-ai",
    component: () => import("@/apps/vertex-ai/page"),
    icon: "Brain",
    category: "Data & Analytics",
  },
]

export function getMicrofrontendById(id: string): MicrofrontendConfig | undefined {
  return microfrontendRegistry.find((mf) => mf.id === id)
}

export function getMicrofrontendByPath(path: string): MicrofrontendConfig | undefined {
  return microfrontendRegistry.find((mf) => mf.path === path)
}
