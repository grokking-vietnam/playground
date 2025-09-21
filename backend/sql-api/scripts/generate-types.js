#!/usr/bin/env node

/**
 * Generate TypeScript types from JSON schemas
 * 
 * This script reads all JSON schema files and generates corresponding TypeScript types
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import { compile } from 'json-schema-to-typescript'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SCHEMAS_DIR = join(__dirname, '../src/schemas')
const TYPES_DIR = join(__dirname, '../src/types')

// Ensure types directory exists
if (!existsSync(TYPES_DIR)) {
  mkdirSync(TYPES_DIR, { recursive: true })
}

/**
 * Resolve local $ref references in JSON schemas
 * @param {Object} schema - The JSON schema object
 * @param {string} schemasDir - Directory containing schema files
 * @returns {Object} Schema with resolved references
 */
function resolveLocalReferences(schema, schemasDir) {
  if (typeof schema !== 'object' || schema === null) {
    return schema
  }
  
  if (Array.isArray(schema)) {
    return schema.map(item => resolveLocalReferences(item, schemasDir))
  }
  
  const resolved = { ...schema }
  
  // Handle $ref to local files
  if (resolved.$ref && resolved.$ref.startsWith('https://api.example.com/schemas/')) {
    const refPath = resolved.$ref.replace('https://api.example.com/schemas/', '')
    const refFilePath = join(schemasDir, refPath)
    
    if (existsSync(refFilePath)) {
      try {
        const refSchema = JSON.parse(readFileSync(refFilePath, 'utf8'))
        // Replace $ref with the actual schema content
        delete resolved.$ref
        Object.assign(resolved, refSchema)
      } catch (error) {
        console.warn(`Warning: Could not resolve reference ${resolved.$ref}:`, error.message)
      }
    }
  }
  
  // Recursively resolve references in nested objects
  for (const [key, value] of Object.entries(resolved)) {
    if (key !== '$ref') {
      resolved[key] = resolveLocalReferences(value, schemasDir)
    }
  }
  
  return resolved
}

// Find all JSON schema files
const schemaFiles = [
  'request/connection-config.json',
  'request/connection-test.json', 
  'request/connection-schema.json',
  'request/query-execute.json',
  'request/query-validate.json',
  'request/query-cancel.json',
  'response/success.json',
  'response/error.json',
  'response/validation-error.json',
  'response/query-result.json'
]

console.log('🔄 Generating TypeScript types from JSON schemas...')

// Generate types for each schema
for (const schemaFile of schemaFiles) {
  const inputPath = join(SCHEMAS_DIR, schemaFile)
  const outputPath = join(TYPES_DIR, schemaFile.replace('.json', '.ts'))
  
  // Ensure output directory exists
  const outputDir = dirname(outputPath)
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }
  
  try {
    // Read JSON schema
    const schema = JSON.parse(readFileSync(inputPath, 'utf8'))
    
    // Resolve local references by replacing $ref URLs with local file paths
    const resolvedSchema = resolveLocalReferences(schema, SCHEMAS_DIR)
    
    // Generate TypeScript types
    const ts = await compile(resolvedSchema, schema.title || basename(schemaFile, '.json'), {
      unreachableDefinitions: true,
      noExtraProps: true,
      style: {
        singleQuote: true,
        semi: true,
        tabWidth: 2
      }
    })
    
    // Write TypeScript file
    writeFileSync(outputPath, ts)
    
    console.log(`✅ Generated: ${schemaFile} → ${schemaFile.replace('.json', '.ts')}`)
  } catch (error) {
    console.error(`❌ Error generating types for ${schemaFile}:`, error.message)
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
