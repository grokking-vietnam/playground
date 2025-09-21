/**
 * SQL Generator utilities for database-specific SQL generation
 */

import type { SchemaTreeNode } from '../types/schema-tree'
import { DatabaseEngine } from '../types/connections'

export interface SQLGenerationContext {
  engine: DatabaseEngine
  schema?: string
  database?: string
  includeSchema?: boolean
  includeDatabase?: boolean
  maxRows?: number
}

export interface SQLTemplate {
  select: string
  insert: string
  update: string
  delete: string
  createTable: string
  dropTable: string
  describe: string
  count: string
}

export class SQLGenerator {
  private static readonly DEFAULT_MAX_ROWS = 100

  /**
   * Generate quick SQL for a schema tree node
   */
  static generateQuickSQL(node: SchemaTreeNode, context: SQLGenerationContext): string {
    const { engine, maxRows = this.DEFAULT_MAX_ROWS } = context

    switch (node.type) {
      case 'table':
      case 'view':
        return this.generateSelectSQL(node, context, maxRows)
      
      case 'column':
        return this.generateColumnSQL(node, context, maxRows)
      
      case 'schema':
        return this.generateSchemaSQL(node, context)
      
      case 'database':
        return this.generateDatabaseSQL(node, context)
      
      default:
        return this.generateDefaultSQL(engine)
    }
  }

  /**
   * Generate SELECT statement for table/view
   */
  static generateSelectSQL(node: SchemaTreeNode, context: SQLGenerationContext, maxRows: number): string {
    const tableName = this.formatObjectName(node.path, context)
    const limitClause = this.getLimitClause(context.engine, maxRows)
    
    return `SELECT *\nFROM ${tableName}${limitClause};`
  }

  /**
   * Generate SELECT statement for specific column
   */
  static generateColumnSQL(node: SchemaTreeNode, context: SQLGenerationContext, maxRows: number): string {
    const tablePath = node.path.slice(0, -1) // Remove column name
    const tableName = this.formatObjectName(tablePath, context)
    const columnName = this.escapeIdentifier(node.name, context.engine)
    const limitClause = this.getLimitClause(context.engine, maxRows)
    
    return `SELECT ${columnName}\nFROM ${tableName}${limitClause};`
  }

  /**
   * Generate INSERT template
   */
  static generateInsertSQL(node: SchemaTreeNode, context: SQLGenerationContext, columns?: string[]): string {
    if (node.type !== 'table') {
      throw new Error('INSERT can only be generated for tables')
    }

    const tableName = this.formatObjectName(node.path, context)
    
    if (columns && columns.length > 0) {
      const columnList = columns.map(col => this.escapeIdentifier(col, context.engine)).join(', ')
      const valuesList = columns.map(() => '?').join(', ')
      return `INSERT INTO ${tableName} (${columnList})\nVALUES (${valuesList});`
    }

    return `INSERT INTO ${tableName} (column1, column2, column3)\nVALUES (value1, value2, value3);`
  }

  /**
   * Generate UPDATE template
   */
  static generateUpdateSQL(node: SchemaTreeNode, context: SQLGenerationContext, columns?: string[]): string {
    if (node.type !== 'table') {
      throw new Error('UPDATE can only be generated for tables')
    }

    const tableName = this.formatObjectName(node.path, context)
    
    if (columns && columns.length > 0) {
      const setClause = columns
        .map(col => `${this.escapeIdentifier(col, context.engine)} = ?`)
        .join(',\n    ')
      return `UPDATE ${tableName}\nSET ${setClause}\nWHERE condition;`
    }

    return `UPDATE ${tableName}\nSET column1 = value1,\n    column2 = value2\nWHERE condition;`
  }

  /**
   * Generate DELETE template
   */
  static generateDeleteSQL(node: SchemaTreeNode, context: SQLGenerationContext): string {
    if (node.type !== 'table') {
      throw new Error('DELETE can only be generated for tables')
    }

    const tableName = this.formatObjectName(node.path, context)
    return `DELETE FROM ${tableName}\nWHERE condition;`
  }

  /**
   * Generate CREATE TABLE template
   */
  static generateCreateTableSQL(node: SchemaTreeNode, context: SQLGenerationContext): string {
    if (node.type !== 'table') {
      throw new Error('CREATE TABLE can only be generated for tables')
    }

    const tableName = this.formatObjectName(node.path, context)
    const columns = this.generateColumnDefinitions(context.engine)
    
    return `CREATE TABLE ${tableName} (\n${columns}\n);`
  }

  /**
   * Generate DROP TABLE statement
   */
  static generateDropTableSQL(node: SchemaTreeNode, context: SQLGenerationContext): string {
    if (node.type !== 'table' && node.type !== 'view') {
      throw new Error('DROP can only be generated for tables and views')
    }

    const objectName = this.formatObjectName(node.path, context)
    const objectType = node.type === 'view' ? 'VIEW' : 'TABLE'
    
    return `DROP ${objectType} ${objectName};`
  }

  /**
   * Generate DESCRIBE/EXPLAIN statement
   */
  static generateDescribeSQL(node: SchemaTreeNode, context: SQLGenerationContext): string {
    const objectName = this.formatObjectName(node.path, context)
    
    switch (context.engine) {
      case DatabaseEngine.MYSQL:
        return `DESCRIBE ${objectName};`
      
      case DatabaseEngine.POSTGRESQL:
        return `\\d ${objectName}`
      
      case DatabaseEngine.BIGQUERY:
        return `SELECT column_name, data_type, is_nullable, column_default\nFROM \`INFORMATION_SCHEMA.COLUMNS\`\nWHERE table_name = '${node.name}';`
      
      case DatabaseEngine.SPARK_SQL:
        return `DESCRIBE TABLE ${objectName};`
      
      default:
        return `DESCRIBE ${objectName};`
    }
  }

  /**
   * Generate COUNT statement
   */
  static generateCountSQL(node: SchemaTreeNode, context: SQLGenerationContext): string {
    if (node.type !== 'table' && node.type !== 'view') {
      throw new Error('COUNT can only be generated for tables and views')
    }

    const tableName = this.formatObjectName(node.path, context)
    return `SELECT COUNT(*) as row_count\nFROM ${tableName};`
  }

  /**
   * Generate schema exploration SQL
   */
  static generateSchemaSQL(node: SchemaTreeNode, context: SQLGenerationContext): string {
    const schemaName = node.name

    switch (context.engine) {
      case DatabaseEngine.MYSQL:
        return `SHOW TABLES FROM ${this.escapeIdentifier(schemaName, context.engine)};`
      
      case DatabaseEngine.POSTGRESQL:
        return `SELECT table_name, table_type\nFROM information_schema.tables\nWHERE table_schema = '${schemaName}'\nORDER BY table_name;`
      
      case DatabaseEngine.BIGQUERY:
        return `SELECT table_name, table_type\nFROM \`${schemaName}.INFORMATION_SCHEMA.TABLES\`\nORDER BY table_name;`
      
      case DatabaseEngine.SPARK_SQL:
        return `SHOW TABLES IN ${this.escapeIdentifier(schemaName, context.engine)};`
      
      default:
        return `SELECT table_name FROM information_schema.tables WHERE table_schema = '${schemaName}';`
    }
  }

  /**
   * Generate database exploration SQL
   */
  static generateDatabaseSQL(node: SchemaTreeNode, context: SQLGenerationContext): string {
    switch (context.engine) {
      case DatabaseEngine.MYSQL:
        return 'SHOW DATABASES;'
      
      case DatabaseEngine.POSTGRESQL:
        return 'SELECT datname FROM pg_database WHERE datistemplate = false;'
      
      case DatabaseEngine.BIGQUERY:
        return 'SELECT schema_name FROM INFORMATION_SCHEMA.SCHEMATA;'
      
      case DatabaseEngine.SPARK_SQL:
        return 'SHOW DATABASES;'
      
      default:
        return 'SHOW DATABASES;'
    }
  }

  /**
   * Generate default/fallback SQL
   */
  static generateDefaultSQL(engine: DatabaseEngine): string {
    switch (engine) {
      case DatabaseEngine.BIGQUERY:
        return 'SELECT 1 as test;'
      
      case DatabaseEngine.MYSQL:
      case DatabaseEngine.POSTGRESQL:
        return 'SELECT 1 as test;'
      
      case DatabaseEngine.SPARK_SQL:
        return 'SELECT 1 as test;'
      
      default:
        return 'SELECT 1 as test;'
    }
  }

  /**
   * Get SQL templates for an engine
   */
  static getTemplates(engine: DatabaseEngine): SQLTemplate {
    const baseTemplates: SQLTemplate = {
      select: 'SELECT * FROM table_name;',
      insert: 'INSERT INTO table_name (column1, column2) VALUES (value1, value2);',
      update: 'UPDATE table_name SET column1 = value1 WHERE condition;',
      delete: 'DELETE FROM table_name WHERE condition;',
      createTable: 'CREATE TABLE table_name (\n  id INTEGER PRIMARY KEY,\n  name VARCHAR(255)\n);',
      dropTable: 'DROP TABLE table_name;',
      describe: 'DESCRIBE table_name;',
      count: 'SELECT COUNT(*) FROM table_name;'
    }

    // Customize templates based on engine
    switch (engine) {
      case DatabaseEngine.BIGQUERY:
        return {
          ...baseTemplates,
          createTable: 'CREATE TABLE dataset.table_name (\n  id INT64,\n  name STRING\n);',
          describe: 'SELECT column_name, data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = "table_name";'
        }
      
      case DatabaseEngine.POSTGRESQL:
        return {
          ...baseTemplates,
          createTable: 'CREATE TABLE table_name (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(255)\n);',
          describe: '\\d table_name'
        }
      
      case DatabaseEngine.MYSQL:
        return {
          ...baseTemplates,
          createTable: 'CREATE TABLE table_name (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(255)\n);'
        }
      
      case DatabaseEngine.SPARK_SQL:
        return {
          ...baseTemplates,
          createTable: 'CREATE TABLE table_name (\n  id BIGINT,\n  name STRING\n) USING DELTA;',
          describe: 'DESCRIBE TABLE table_name;'
        }
      
      default:
        return baseTemplates
    }
  }

  /**
   * Private helper methods
   */

  private static formatObjectName(path: string[], context: SQLGenerationContext): string {
    const { engine, includeDatabase = true, includeSchema = true } = context
    
    // Remove connection ID if present (first element might be connection info)
    const cleanPath = path.filter(segment => !segment.includes('.') || !segment.startsWith('conn-'))
    
    if (cleanPath.length === 1) {
      // Just table name
      return this.escapeIdentifier(cleanPath[0], engine)
    } else if (cleanPath.length === 2) {
      // Schema.table
      const [schema, table] = cleanPath
      if (includeSchema) {
        return `${this.escapeIdentifier(schema, engine)}.${this.escapeIdentifier(table, engine)}`
      }
      return this.escapeIdentifier(table, engine)
    } else if (cleanPath.length >= 3) {
      // Database.schema.table
      const [database, schema, table] = cleanPath
      const parts = []
      
      if (includeDatabase && engine !== DatabaseEngine.BIGQUERY) {
        parts.push(this.escapeIdentifier(database, engine))
      }
      if (includeSchema || engine === DatabaseEngine.BIGQUERY) {
        parts.push(this.escapeIdentifier(schema, engine))
      }
      parts.push(this.escapeIdentifier(table, engine))
      
      return parts.join('.')
    }
    
    return this.escapeIdentifier(cleanPath[cleanPath.length - 1], engine)
  }

  private static escapeIdentifier(identifier: string, engine: DatabaseEngine): string {
    switch (engine) {
      case DatabaseEngine.BIGQUERY:
        return `\`${identifier}\``
      
      case DatabaseEngine.MYSQL:
        return `\`${identifier}\``
      
      case DatabaseEngine.POSTGRESQL:
        return `"${identifier}"`
      
      case DatabaseEngine.SPARK_SQL:
        return `\`${identifier}\``
      
      default:
        return identifier
    }
  }

  private static getLimitClause(engine: DatabaseEngine, maxRows: number): string {
    switch (engine) {
      case DatabaseEngine.BIGQUERY:
        return `\nLIMIT ${maxRows}`
      
      case DatabaseEngine.MYSQL:
      case DatabaseEngine.POSTGRESQL:
      case DatabaseEngine.SPARK_SQL:
        return `\nLIMIT ${maxRows}`
      
      default:
        return `\nLIMIT ${maxRows}`
    }
  }

  private static generateColumnDefinitions(engine: DatabaseEngine): string {
    switch (engine) {
      case DatabaseEngine.BIGQUERY:
        return '  id INT64,\n  name STRING,\n  created_at TIMESTAMP'
      
      case DatabaseEngine.MYSQL:
        return '  id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
      
      case DatabaseEngine.POSTGRESQL:
        return '  id SERIAL PRIMARY KEY,\n  name VARCHAR(255) NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
      
      case DatabaseEngine.SPARK_SQL:
        return '  id BIGINT,\n  name STRING,\n  created_at TIMESTAMP'
      
      default:
        return '  id INTEGER PRIMARY KEY,\n  name VARCHAR(255),\n  created_at TIMESTAMP'
    }
  }
}