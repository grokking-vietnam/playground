/**
 * Utility to load JSON schema files
 * 
 * This utility provides a consistent way to load JSON files
 * that works with both Node.js and Jest environments
 */

import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Load a JSON file relative to the schemas directory
 * @param {string} filename - The JSON filename to load
 * @returns {object} The parsed JSON object
 */
export function loadJson(filename) {
  // Use a relative path from the project root
  const path = join(process.cwd(), 'src', 'schemas', filename)
  return JSON.parse(readFileSync(path, 'utf8'))
}
