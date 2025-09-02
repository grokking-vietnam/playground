/**
 * Index file for SQL editor types
 */

// Editor types
export type {
  DatabaseEngine,
  EditorSettings,
  SQLLanguageConfig,
  SQLFunction,
  Parameter,
  CompletionContext,
  HoverContext,
  ValidationContext
} from './editor';

// Schema types
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
  SchemaCache,
  SchemaProviderOptions,
  SchemaUpdateEvent,
  SchemaQuery
} from './schema';