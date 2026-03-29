/**
 * PostgreSQL Metadata Extractor
 * 
 * Extracts detailed metadata about PostgreSQL database objects like indexes,
 * constraints, and table statistics.
 */

import { Client } from 'pg'
import { MetadataExtractor, IndexInfo, ConstraintInfo } from '../base/interfaces'
import { DatabaseConnection, DatabaseEngine } from '../../types/connections'
import { PostgresConnectionManager } from './PostgresConnectionManager'

/**
 * PostgreSQL-specific metadata extractor
 */
export class BaseMetadataExtractor implements MetadataExtractor {
  public readonly engine = DatabaseEngine.POSTGRESQL

  constructor(private connectionManager: PostgresConnectionManager) {}

  /**
   * Extract table metadata
   */
  public async extractTableMetadata(connection: DatabaseConnection, tableName: string): Promise<Record<string, any>> {
    const client = this.connectionManager.getClient() as Client
    
    const [tableInfo, tableStats, tableSize] = await Promise.all([
      this.getTableInfo(client, tableName),
      this.getTableStats(client, tableName),
      this.getTableSize(client, tableName)
    ])

    return {
      ...tableInfo,
      statistics: tableStats,
      size: tableSize
    }
  }

  /**
   * Extract index information
   */
  public async extractIndexInfo(connection: DatabaseConnection, tableName: string): Promise<IndexInfo[]> {
    const client = this.connectionManager.getClient() as Client
    
    const query = `
      SELECT 
        i.relname as index_name,
        array_agg(a.attname ORDER BY a.attnum) as columns,
        ix.indisunique as is_unique,
        ix.indisprimary as is_primary
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relname = $1
      GROUP BY i.relname, ix.indisunique, ix.indisprimary
      ORDER BY i.relname
    `

    const result = await client.query(query, [tableName])
    
    return result.rows.map(row => ({
      name: row.index_name,
      columns: row.columns,
      isUnique: row.is_unique,
      isPrimary: row.is_primary
    }))
  }

  /**
   * Extract constraint information
   */
  public async extractConstraints(connection: DatabaseConnection, tableName: string): Promise<ConstraintInfo[]> {
    const client = this.connectionManager.getClient() as Client
    
    const query = `
      SELECT 
        tc.constraint_name as name,
        tc.constraint_type as type,
        array_agg(kcu.column_name ORDER BY kcu.ordinal_position) as columns,
        ccu.table_name as referenced_table,
        array_agg(ccu.column_name ORDER BY kcu.ordinal_position) as referenced_columns
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu 
        ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
      WHERE tc.table_name = $1
      GROUP BY tc.constraint_name, tc.constraint_type, ccu.table_name
      ORDER BY tc.constraint_name
    `

    const result = await client.query(query, [tableName])
    
    return result.rows.map(row => ({
      name: row.name,
      type: this.mapConstraintType(row.type),
      columns: row.columns.filter(Boolean),
      referencedTable: row.referenced_table,
      referencedColumns: row.referenced_columns.filter(Boolean)
    }))
  }

  /**
   * Get basic table information
   */
  private async getTableInfo(client: Client, tableName: string): Promise<Record<string, any>> {
    const query = `
      SELECT 
        t.relname as table_name,
        t.relkind as table_type,
        t.reltuples as estimated_rows,
        t.relpages as pages,
        n.nspname as schema_name,
        obj_description(t.oid) as comment
      FROM pg_class t
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE t.relname = $1 AND t.relkind IN ('r', 'v', 'm')
    `

    const result = await client.query(query, [tableName])
    return result.rows[0] || {}
  }

  /**
   * Get table statistics
   */
  private async getTableStats(client: Client, tableName: string): Promise<Record<string, any>> {
    try {
      const query = `
        SELECT 
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables
        WHERE relname = $1
      `

      const result = await client.query(query, [tableName])
      return result.rows[0] || {}
    } catch (error) {
      console.warn('Failed to get table statistics:', error)
      return {}
    }
  }

  /**
   * Get table size information
   */
  private async getTableSize(client: Client, tableName: string): Promise<Record<string, any>> {
    try {
      const query = `
        SELECT 
          pg_size_pretty(pg_total_relation_size($1)) as total_size,
          pg_size_pretty(pg_relation_size($1)) as table_size,
          pg_size_pretty(pg_total_relation_size($1) - pg_relation_size($1)) as index_size,
          pg_total_relation_size($1) as total_bytes,
          pg_relation_size($1) as table_bytes
      `

      const result = await client.query(query, [tableName])
      return result.rows[0] || {}
    } catch (error) {
      console.warn('Failed to get table size:', error)
      return {}
    }
  }

  /**
   * Map PostgreSQL constraint types to standard types
   */
  private mapConstraintType(pgType: string): 'primary' | 'foreign' | 'unique' | 'check' {
    switch (pgType) {
      case 'PRIMARY KEY': return 'primary'
      case 'FOREIGN KEY': return 'foreign'
      case 'UNIQUE': return 'unique'
      case 'CHECK': return 'check'
      default: return 'check'
    }
  }
}