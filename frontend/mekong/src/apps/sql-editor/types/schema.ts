/**
 * Schema-specific types for database introspection
 */

import type { DatabaseSchema } from './editor';

export interface SchemaCache {
  [connectionId: string]: {
    schema: DatabaseSchema;
    timestamp: number;
    expires: number;
  };
}

export interface SchemaProviderOptions {
  cacheTimeout: number; // milliseconds
  maxCacheSize: number;
  enableAutoRefresh: boolean;
}

export interface SchemaUpdateEvent {
  connectionId: string;
  schema: DatabaseSchema;
  changeType: 'full' | 'incremental';
}

export interface SchemaQuery {
  connectionId: string;
  includeSystemTables: boolean;
  includeViews: boolean;
  includeProcedures: boolean;
  includeIndexes: boolean;
  schemaFilter?: string[];
  tableFilter?: string[];
}

// Re-export commonly used types from editor.ts
export type {
  DatabaseSchema,
  Database,
  Table,
  Column,
  Index,
  Constraint,
  ForeignKey,
  Relationship,
  StoredProcedure,
  SQLFunction,
  Parameter
} from './editor';