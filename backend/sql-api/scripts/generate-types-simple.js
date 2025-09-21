#!/usr/bin/env node

/**
 * Generate TypeScript types from JSON schemas
 * 
 * This script reads all JSON schema files and generates corresponding TypeScript types
 * using a simpler approach that handles references manually
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SCHEMAS_DIR = join(__dirname, '../src/schemas')
const TYPES_DIR = join(__dirname, '../src/types')

// Ensure types directory exists
if (!existsSync(TYPES_DIR)) {
  mkdirSync(TYPES_DIR, { recursive: true })
}

/**
 * Convert JSON schema to TypeScript interface
 * @param {Object} schema - The JSON schema object
 * @param {string} name - The interface name
 * @returns {string} TypeScript interface definition
 */
function schemaToTypeScript(schema, name) {
  if (!schema || typeof schema !== 'object') {
    return 'any'
  }

  // Handle references
  if (schema.$ref) {
    if (schema.$ref === 'https://api.example.com/schemas/connection-config.json') {
      return 'DatabaseConnectionConfiguration'
    }
    return 'any'
  }

  // Handle allOf
  if (schema.allOf) {
    return schema.allOf.map(subSchema => schemaToTypeScript(subSchema, name)).join(' & ')
  }

  // Handle oneOf
  if (schema.oneOf) {
    return schema.oneOf.map(subSchema => schemaToTypeScript(subSchema, name)).join(' | ')
  }

  // Handle anyOf
  if (schema.anyOf) {
    return schema.oneOf.map(subSchema => schemaToTypeScript(subSchema, name)).join(' | ')
  }

  // Handle basic types
  switch (schema.type) {
    case 'string':
      if (schema.enum) {
        return schema.enum.map(val => `'${val}'`).join(' | ')
      }
      return 'string'
    
    case 'number':
    case 'integer':
      return 'number'
    
    case 'boolean':
      return 'boolean'
    
    case 'array':
      const itemType = schema.items ? schemaToTypeScript(schema.items, name) : 'any'
      return `${itemType}[]`
    
    case 'object':
      if (!schema.properties) {
        return 'Record<string, any>'
      }
      
      const properties = Object.entries(schema.properties).map(([key, propSchema]) => {
        const isRequired = schema.required && schema.required.includes(key)
        const optional = isRequired ? '' : '?'
        const type = schemaToTypeScript(propSchema, key)
        const description = propSchema.description ? `\n  /**\n   * ${propSchema.description}\n   */` : ''
        return `${description}\n  ${key}${optional}: ${type};`
      }).join('\n')
      
      return `{\n${properties}\n}`
    
    default:
      return 'any'
  }
}

/**
 * Generate TypeScript interface from JSON schema
 * @param {Object} schema - The JSON schema object
 * @param {string} name - The interface name
 * @returns {string} Complete TypeScript interface
 */
function generateInterface(schema, name) {
  const description = schema.description ? `\n/**\n * ${schema.description}\n */` : ''
  const interfaceBody = schemaToTypeScript(schema, name)
  
  return `/* eslint-disable */
/**
 * This file was automatically generated from JSON schema.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run 'npm run generate-types' to regenerate this file.
 */${description}
export interface ${name} ${interfaceBody}
`
}

// Find all JSON schema files
const schemaFiles = [
  { file: 'request/connection-config.json', name: 'DatabaseConnectionConfiguration' },
  { file: 'request/connection-test.json', name: 'ConnectionTestRequest' },
  { file: 'request/connection-schema.json', name: 'ConnectionSchemaRequest' },
  { file: 'request/query-execute.json', name: 'QueryExecuteRequest' },
  { file: 'request/query-validate.json', name: 'QueryValidateRequest' },
  { file: 'request/query-cancel.json', name: 'QueryCancelRequest' },
  { file: 'response/success.json', name: 'SuccessResponse' },
  { file: 'response/error.json', name: 'ErrorResponse' },
  { file: 'response/validation-error.json', name: 'ValidationErrorResponse' },
  { file: 'response/query-result.json', name: 'QueryResultData' }
]

console.log('🔄 Generating TypeScript types from JSON schemas...')

// Generate types for each schema
for (const { file, name } of schemaFiles) {
  const inputPath = join(SCHEMAS_DIR, file)
  const outputPath = join(TYPES_DIR, file.replace('.json', '.ts'))
  
  // Ensure output directory exists
  const outputDir = dirname(outputPath)
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }
  
  try {
    // Read JSON schema
    const schema = JSON.parse(readFileSync(inputPath, 'utf8'))
    
    // Generate TypeScript interface
    const ts = generateInterface(schema, name)
    
    // Write TypeScript file
    writeFileSync(outputPath, ts)
    
    console.log(`✅ Generated: ${file} → ${file.replace('.json', '.ts')}`)
  } catch (error) {
    console.error(`❌ Error generating types for ${file}:`, error.message)
  }
}

// Generate index file that exports all types
const indexContent = `/**
 * Generated TypeScript types from JSON schemas
 * 
 * This file is auto-generated. Do not edit manually.
 * Run 'npm run generate-types' to regenerate.
 */

// Request types
export * from './request/connection-config.js'
export * from './request/connection-test.js'
export * from './request/connection-schema.js'
export * from './request/query-execute.js'
export * from './request/query-validate.js'
export * from './request/query-cancel.js'

// Response types
export * from './response/success.js'
export * from './response/error.js'
export * from './response/validation-error.js'
export * from './response/query-result.js'
`

writeFileSync(join(TYPES_DIR, 'index.ts'), indexContent)
console.log('✅ Generated: index.ts')

console.log('🎉 Type generation complete!')
