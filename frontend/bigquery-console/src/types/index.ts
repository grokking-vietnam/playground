export interface Dataset {
  id: string
  name: string
  description?: string
  location: string
  createdAt: string
  lastModified: string
  tables: Table[]
}

export interface Table {
  id: string
  name: string
  description?: string
  schema: TableSchema[]
  rows: number
  size: number
  lastModified: string
  type: 'TABLE' | 'VIEW' | 'EXTERNAL'
}

export interface TableSchema {
  name: string
  type: string
  mode: 'NULLABLE' | 'REQUIRED' | 'REPEATED'
  description?: string
}

export interface QueryJob {
  id: string
  query: string
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'ERROR'
  createdAt: string
  startedAt?: string
  completedAt?: string
  duration?: number
  bytesProcessed?: number
  bytesScanned?: number
  rowsReturned?: number
  error?: string
}

export interface QueryResult {
  jobId: string
  schema: TableSchema[]
  rows: Record<string, any>[]
  totalRows: number
  pageToken?: string
}

export interface Project {
  id: string
  name: string
  datasets: Dataset[]
}
