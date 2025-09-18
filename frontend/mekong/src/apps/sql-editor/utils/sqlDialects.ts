/**
 * SQL dialect configurations for different database engines
 */

import type { SQLFunction, SQLLanguageConfig } from '../types';
import { DatabaseEngine } from '../types/connections';

export const SQL_KEYWORDS = {
  COMMON: [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
    'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA', 'COLUMN', 'CONSTRAINT', 'PRIMARY',
    'FOREIGN', 'KEY', 'UNIQUE', 'NOT', 'NULL', 'DEFAULT', 'AUTO_INCREMENT', 'IDENTITY',
    'AND', 'OR', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'AS', 'CASE', 'WHEN', 'THEN',
    'ELSE', 'END', 'IF', 'DISTINCT', 'ALL', 'UNION', 'INTERSECT', 'EXCEPT', 'JOIN',
    'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'ON', 'USING', 'ORDER', 'BY',
    'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'TOP', 'WITH', 'RECURSIVE', 'CTE'
  ],
  
  BIGQUERY: [
    'STRUCT', 'ARRAY', 'UNNEST', 'SAFE_CAST', 'EXTRACT', 'GENERATE_ARRAY',
    'GENERATE_DATE_ARRAY', 'PARSE_JSON', 'JSON_EXTRACT', 'JSON_EXTRACT_SCALAR',
    'APPROX_COUNT_DISTINCT', 'APPROX_QUANTILES', 'STDDEV', 'VARIANCE'
  ],
  
  MYSQL: [
    'AUTO_INCREMENT', 'UNSIGNED', 'ZEROFILL', 'BINARY', 'ASCII', 'UNICODE',
    'ENGINE', 'CHARACTER', 'COLLATE', 'COMMENT', 'TEMPORARY', 'IF NOT EXISTS',
    'REPLACE', 'IGNORE', 'LOW_PRIORITY', 'HIGH_PRIORITY', 'DELAYED'
  ],
  
  POSTGRESQL: [
    'SERIAL', 'BIGSERIAL', 'SMALLSERIAL', 'RETURNING', 'ILIKE', 'SIMILAR TO',
    'REGEXP', 'ARRAY', 'JSONB', 'INTERVAL', 'EXTRACT', 'WINDOW', 'OVER',
    'PARTITION BY', 'WITHIN GROUP', 'FILTER', 'LATERAL'
  ],
  
  SPARK: [
    'LATERAL', 'TABLESAMPLE', 'BUCKET', 'SORT BY', 'DISTRIBUTE BY', 'CLUSTER BY',
    'MSCK', 'REPAIR', 'ANALYZE', 'COMPUTE', 'STATISTICS', 'CACHED', 'LAZY',
    'REPARTITION', 'COALESCE'
  ]
};

export const SQL_DATA_TYPES = {
  COMMON: [
    'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC',
    'FLOAT', 'REAL', 'DOUBLE', 'CHAR', 'VARCHAR', 'TEXT', 'DATE', 'TIME',
    'TIMESTAMP', 'DATETIME', 'BOOLEAN', 'BOOL', 'BINARY', 'VARBINARY', 'BLOB'
  ],
  
  BIGQUERY: [
    'STRING', 'BYTES', 'INT64', 'FLOAT64', 'NUMERIC', 'BIGNUMERIC', 'BOOL',
    'DATE', 'DATETIME', 'TIME', 'TIMESTAMP', 'INTERVAL', 'ARRAY', 'STRUCT',
    'JSON', 'GEOGRAPHY'
  ],
  
  MYSQL: [
    'TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'BIGINT', 'FLOAT', 'DOUBLE',
    'DECIMAL', 'BIT', 'CHAR', 'VARCHAR', 'TINYTEXT', 'TEXT', 'MEDIUMTEXT',
    'LONGTEXT', 'BINARY', 'VARBINARY', 'TINYBLOB', 'BLOB', 'MEDIUMBLOB',
    'LONGBLOB', 'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR', 'JSON',
    'GEOMETRY', 'POINT', 'LINESTRING', 'POLYGON', 'ENUM', 'SET'
  ],
  
  POSTGRESQL: [
    'SMALLINT', 'INTEGER', 'BIGINT', 'DECIMAL', 'NUMERIC', 'REAL', 'DOUBLE PRECISION',
    'SMALLSERIAL', 'SERIAL', 'BIGSERIAL', 'MONEY', 'CHARACTER', 'VARCHAR', 'TEXT',
    'BYTEA', 'TIMESTAMP', 'DATE', 'TIME', 'INTERVAL', 'BOOLEAN', 'ENUM', 'ARRAY',
    'JSON', 'JSONB', 'UUID', 'XML', 'INET', 'CIDR', 'MACADDR', 'POINT', 'LINE',
    'LSEG', 'BOX', 'PATH', 'POLYGON', 'CIRCLE'
  ],
  
  SPARK: [
    'BYTE', 'SHORT', 'INT', 'LONG', 'FLOAT', 'DOUBLE', 'DECIMAL', 'STRING',
    'BINARY', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'ARRAY', 'MAP', 'STRUCT'
  ]
};

export const SQL_FUNCTIONS: { [key: string]: SQLFunction[] } = {
  COMMON: [
    {
      name: 'COUNT',
      description: 'Returns the number of rows',
      syntax: 'COUNT(*) or COUNT(column)',
      returnType: 'INTEGER',
      parameters: [{ name: 'expression', type: 'ANY', optional: true }],
      category: 'aggregate'
    },
    {
      name: 'SUM',
      description: 'Returns the sum of all values',
      syntax: 'SUM(column)',
      returnType: 'NUMERIC',
      parameters: [{ name: 'expression', type: 'NUMERIC', optional: false }],
      category: 'aggregate'
    },
    {
      name: 'AVG',
      description: 'Returns the average value',
      syntax: 'AVG(column)',
      returnType: 'NUMERIC',
      parameters: [{ name: 'expression', type: 'NUMERIC', optional: false }],
      category: 'aggregate'
    },
    {
      name: 'MAX',
      description: 'Returns the maximum value',
      syntax: 'MAX(column)',
      returnType: 'ANY',
      parameters: [{ name: 'expression', type: 'ANY', optional: false }],
      category: 'aggregate'
    },
    {
      name: 'MIN',
      description: 'Returns the minimum value',
      syntax: 'MIN(column)',
      returnType: 'ANY',
      parameters: [{ name: 'expression', type: 'ANY', optional: false }],
      category: 'aggregate'
    }
  ],
  
  BIGQUERY: [
    {
      name: 'ARRAY_AGG',
      description: 'Returns an array of concatenated values',
      syntax: 'ARRAY_AGG([DISTINCT] expression [ORDER BY key])',
      returnType: 'ARRAY',
      parameters: [
        { name: 'expression', type: 'ANY', optional: false },
        { name: 'order_by', type: 'ANY', optional: true }
      ],
      category: 'aggregate',
      engine: 'bigquery'
    },
    {
      name: 'SAFE_CAST',
      description: 'Safely casts a value to another data type',
      syntax: 'SAFE_CAST(expression AS typename)',
      returnType: 'typename',
      parameters: [
        { name: 'expression', type: 'ANY', optional: false },
        { name: 'typename', type: 'STRING', optional: false }
      ],
      category: 'scalar',
      engine: 'bigquery'
    }
  ],
  
  MYSQL: [
    {
      name: 'GROUP_CONCAT',
      description: 'Returns a concatenated string',
      syntax: 'GROUP_CONCAT([DISTINCT] expr [ORDER BY] [SEPARATOR sep])',
      returnType: 'STRING',
      parameters: [
        { name: 'expression', type: 'STRING', optional: false },
        { name: 'separator', type: 'STRING', optional: true }
      ],
      category: 'aggregate',
      engine: 'mysql'
    }
  ],
  
  POSTGRESQL: [
    {
      name: 'STRING_AGG',
      description: 'Concatenates values with a delimiter',
      syntax: 'STRING_AGG(expression, delimiter [ORDER BY])',
      returnType: 'STRING',
      parameters: [
        { name: 'expression', type: 'STRING', optional: false },
        { name: 'delimiter', type: 'STRING', optional: false }
      ],
      category: 'aggregate',
      engine: 'postgresql'
    },
    {
      name: 'ROW_NUMBER',
      description: 'Returns the sequential number of a row',
      syntax: 'ROW_NUMBER() OVER (ORDER BY column)',
      returnType: 'INTEGER',
      parameters: [],
      category: 'window',
      engine: 'postgresql'
    }
  ]
};

export const SQL_OPERATORS = {
  COMMON: ['=', '!=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '%', '||'],
  BIGQUERY: ['||', '&&', 'IS NULL', 'IS NOT NULL'],
  MYSQL: ['<<=', '>>=', '&', '|', '^', '~', '<<', '>>'],
  POSTGRESQL: ['||', '&&', '@>', '<@', '?', '?&', '?|', '#-', '->>'],
  SPARK: ['<<=', '>>=', '&', '|', '^', '~']
};

export function getDialectConfig(engine: DatabaseEngine): Partial<SQLLanguageConfig> {
  const baseKeywords = SQL_KEYWORDS.COMMON;
  const baseDataTypes = SQL_DATA_TYPES.COMMON;
  const baseFunctions = SQL_FUNCTIONS.COMMON;
  const baseOperators = SQL_OPERATORS.COMMON;

  switch (engine) {
    case DatabaseEngine.BIGQUERY:
      return {
        keywords: [...baseKeywords, ...SQL_KEYWORDS.BIGQUERY],
        dataTypes: [...baseDataTypes, ...SQL_DATA_TYPES.BIGQUERY],
        functions: [...baseFunctions, ...SQL_FUNCTIONS.BIGQUERY],
        operators: [...baseOperators, ...SQL_OPERATORS.BIGQUERY]
      };
      
    case DatabaseEngine.MYSQL:
      return {
        keywords: [...baseKeywords, ...SQL_KEYWORDS.MYSQL],
        dataTypes: [...baseDataTypes, ...SQL_DATA_TYPES.MYSQL],
        functions: [...baseFunctions, ...SQL_FUNCTIONS.MYSQL],
        operators: [...baseOperators, ...SQL_OPERATORS.MYSQL]
      };
      
    case DatabaseEngine.POSTGRESQL:
      return {
        keywords: [...baseKeywords, ...SQL_KEYWORDS.POSTGRESQL],
        dataTypes: [...baseDataTypes, ...SQL_DATA_TYPES.POSTGRESQL],
        functions: [...baseFunctions, ...SQL_FUNCTIONS.POSTGRESQL],
        operators: [...baseOperators, ...SQL_OPERATORS.POSTGRESQL]
      };
      
    case DatabaseEngine.SPARK_SQL:
      return {
        keywords: [...baseKeywords, ...SQL_KEYWORDS.SPARK],
        dataTypes: [...baseDataTypes, ...SQL_DATA_TYPES.SPARK],
        functions: baseFunctions, // Use common functions for Spark
        operators: [...baseOperators, ...SQL_OPERATORS.SPARK]
      };
      
    default:
      return {
        keywords: baseKeywords,
        dataTypes: baseDataTypes,
        functions: baseFunctions,
        operators: baseOperators
      };
  }
}