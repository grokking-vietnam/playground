/**
 * TypeScript interfaces for the enhanced SQL editor
 */

import * as monaco from 'monaco-editor';
import { DatabaseEngine } from './connections';

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoComplete: boolean;
  syntaxHighlighting: boolean;
  errorHighlighting: boolean;
  formatOnType: boolean;
}

export interface SQLLanguageConfig {
  engine: DatabaseEngine;
  schema?: DatabaseSchema;
  keywords: string[];
  functions: SQLFunction[];
  operators: string[];
  dataTypes: string[];
}

export interface SQLFunction {
  name: string;
  description: string;
  syntax: string;
  returnType: string;
  parameters: Parameter[];
  category: 'aggregate' | 'scalar' | 'table' | 'window';
  engine?: string;
}

export interface Parameter {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

export interface DatabaseSchema {
  connectionId: string;
  databases: Database[];
  tables: Table[];
  columns: Column[];
  relationships: Relationship[];
  functions: SQLFunction[];
  procedures: StoredProcedure[];
  lastUpdated: Date;
}

export interface Database {
  id: string;
  name: string;
  tables: Table[];
}

export interface Table {
  id: string;
  name: string;
  schema: string;
  database: string;
  type: 'table' | 'view' | 'materialized_view';
  columns: Column[];
  indexes: Index[];
  constraints: Constraint[];
  description?: string;
  rowCount?: number;
}

export interface Column {
  id: string;
  name: string;
  dataType: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: ForeignKey;
  defaultValue?: string;
  description?: string;
}

export interface Index {
  id: string;
  name: string;
  columns: string[];
  unique: boolean;
  type: string;
}

export interface Constraint {
  id: string;
  name: string;
  type: 'PRIMARY_KEY' | 'FOREIGN_KEY' | 'UNIQUE' | 'CHECK' | 'NOT_NULL';
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
}

export interface ForeignKey {
  referencedTable: string;
  referencedColumn: string;
}

export interface Relationship {
  id: string;
  fromTable: string;
  toTable: string;
  fromColumns: string[];
  toColumns: string[];
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface StoredProcedure {
  id: string;
  name: string;
  schema: string;
  parameters: Parameter[];
  returnType?: string;
  description?: string;
}

export interface CompletionContext {
  model: monaco.editor.ITextModel;
  position: monaco.Position;
  triggerCharacter?: string;
  schema?: DatabaseSchema;
  engine: DatabaseEngine;
}

export interface HoverContext {
  model: monaco.editor.ITextModel;
  position: monaco.Position;
  schema?: DatabaseSchema;
  engine: DatabaseEngine;
}

export interface ValidationContext {
  model: monaco.editor.ITextModel;
  schema?: DatabaseSchema;
  engine: DatabaseEngine;
}