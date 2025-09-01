import type React from "react"

export interface MicrofrontendConfig {
  id: string
  name: string
  path: string
  component: () => Promise<{ default: React.ComponentType<any> }>
  icon: string
  category: string
  description?: string
}

export const microfrontendRegistry: MicrofrontendConfig[] = [
  {
    id: "home",
    name: "Home",
    path: "/",
    component: () => import("@/apps/home/page"),
    icon: "Home",
    category: "Dashboard",
    description: "Google Cloud-style welcome page with quick access to all services",
  },
  {
    id: "bigquery",
    name: "BigQuery Studio",
    path: "/bigquery",
    component: () => import("@/apps/bigquery/page"),
    icon: "Database",
    category: "Data & Analytics",
    description: "Enterprise data platform with SQL query capabilities",
  },
  {
    id: "codeeditor",
    name: "Code Editor",
    path: "/code-editor",
    component: () => import("@/apps/code-editor/page"),
    icon: "Code",
    category: "Development",
    description: "Advanced code editor with syntax highlighting and multiple file support",
  },
  {
    id: "usermanagement",
    name: "User Management",
    path: "/user-management",
    component: () => import("@/apps/user-management/page"),
    icon: "Users",
    category: "Management",
    description: "Manage users, roles, and permissions",
  },
  {
    id: "permissioncontrol",
    name: "Permission Control",
    path: "/permission-control",
    component: () => import("@/apps/permission-control/page"),
    icon: "Shield",
    category: "Management",
    description: "Configure access controls and security policies",
  },
  {
    id: "workflowmanagement",
    name: "Workflow Management",
    path: "/workflow-management",
    component: () => import("@/apps/workflow-management/page"),
    icon: "Workflow",
    category: "Management",
    description: "Design and manage business workflows",
  },
  {
    id: "datacatalog",
    name: "Data Catalog",
    path: "/data-catalog",
    component: () => import("@/apps/data-catalog/page"),
    icon: "GitBranch",
    category: "Data & Analytics",
    description: "Discover and catalog data assets",
  },
  {
    id: "vertexai",
    name: "Vertex AI",
    path: "/vertex-ai",
    component: () => import("@/apps/vertex-ai/page"),
    icon: "Brain",
    category: "Data & Analytics",
    description: "Machine learning and AI model management",
  },
]

export function getMicrofrontendById(id: string): MicrofrontendConfig | undefined {
  return microfrontendRegistry.find((mf) => mf.id === id)
}

export function getMicrofrontendByPath(path: string): MicrofrontendConfig | undefined {
  return microfrontendRegistry.find((mf) => mf.path === path)
}

export function getMicrofrontendsByCategory(category: string): MicrofrontendConfig[] {
  return microfrontendRegistry.filter((mf) => mf.category === category)
}

export function getAllCategories(): string[] {
  return Array.from(new Set(microfrontendRegistry.map((mf) => mf.category)))
}