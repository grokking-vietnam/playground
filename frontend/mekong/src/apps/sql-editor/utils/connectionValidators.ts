/**
 * Connection Validation Utilities
 * 
 * Validation functions for database connection forms and data.
 * Provides comprehensive validation for different database engines.
 */

import { DatabaseEngine, ConnectionFormData, DEFAULT_PORTS } from '../types/connections'

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean
  /** Error messages by field */
  errors: Record<string, string>
  /** Warning messages by field */
  warnings?: Record<string, string>
}

/**
 * Field validation rules
 */
interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any, formData: ConnectionFormData) => string | null
}

/**
 * Validation rules for connection fields
 */
const VALIDATION_RULES: Record<keyof ConnectionFormData, ValidationRule> = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_]+$/
  },
  engine: {
    required: true,
    custom: (value) => {
      if (!Object.values(DatabaseEngine).includes(value)) {
        return 'Invalid database engine'
      }
      return null
    }
  },
  host: {
    required: true,
    minLength: 1,
    maxLength: 255,
    custom: (value) => {
      // Basic hostname/IP validation
      const hostnamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
      const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      
      if (!hostnamePattern.test(value) && !ipPattern.test(value) && value !== 'localhost') {
        return 'Invalid hostname or IP address'
      }
      return null
    }
  },
  port: {
    required: true,
    custom: (value) => {
      const port = Number(value)
      if (isNaN(port) || port < 1 || port > 65535) {
        return 'Port must be between 1 and 65535'
      }
      return null
    }
  },
  database: {
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9_\-]+$/
  },
  username: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  password: {
    required: true,
    minLength: 1,
    maxLength: 500
  },
  ssl: {
    required: false
  },
  connectionString: {
    required: false,
    custom: (value, formData) => {
      if (value && value.trim()) {
        return validateConnectionString(value, formData.engine)
      }
      return null
    }
  }
}

/**
 * Engine-specific validation rules
 */
const ENGINE_SPECIFIC_RULES: Record<DatabaseEngine, Partial<Record<keyof ConnectionFormData, ValidationRule>>> = {
  [DatabaseEngine.BIGQUERY]: {
    host: {
      required: false // BigQuery uses project ID instead
    },
    database: {
      pattern: /^[a-zA-Z0-9_\-]+$/,
      custom: (value) => {
        // BigQuery dataset naming rules
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return 'BigQuery dataset names can only contain letters, numbers, and underscores'
        }
        return null
      }
    }
  },
  [DatabaseEngine.SNOWFLAKE]: {
    host: {
      pattern: /^[a-zA-Z0-9\-]+\.snowflakecomputing\.com$/,
      custom: (value) => {
        if (!value.includes('.snowflakecomputing.com')) {
          return 'Snowflake host must be in format: account.region.snowflakecomputing.com'
        }
        return null
      }
    },
    database: {
      pattern: /^[a-zA-Z0-9_]+$/,
      custom: (value) => {
        if (value.length > 255) {
          return 'Database name is too long'
        }
        return null
      }
    }
  },
  [DatabaseEngine.POSTGRESQL]: {
    database: {
      pattern: /^[a-zA-Z0-9_]+$/,
      custom: (value) => {
        // PostgreSQL database naming rules
        if (value.startsWith('_') || /^\d/.test(value)) {
          return 'PostgreSQL database names cannot start with numbers or underscores'
        }
        return null
      }
    }
  },
  [DatabaseEngine.MYSQL]: {
    database: {
      pattern: /^[a-zA-Z0-9_]+$/,
      maxLength: 64
    }
  },
  [DatabaseEngine.SPARK_SQL]: {
    database: {
      pattern: /^[a-zA-Z0-9_]+$/
    }
  }
}

/**
 * Validate connection form data
 */
export function validateConnectionForm(data: ConnectionFormData): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  // Get engine-specific rules
  const engineRules = ENGINE_SPECIFIC_RULES[data.engine] || {}

  // Validate each field
  for (const [field, value] of Object.entries(data)) {
    const fieldKey = field as keyof ConnectionFormData
    const baseRule = VALIDATION_RULES[fieldKey]
    const engineRule = engineRules[fieldKey]
    const rule = { ...baseRule, ...engineRule }

    const error = validateField(fieldKey, value, rule, data)
    if (error) {
      errors[field] = error
    }
  }

  // Cross-field validation
  const crossFieldErrors = validateCrossFields(data)
  Object.assign(errors, crossFieldErrors)

  // Generate warnings
  const fieldWarnings = generateWarnings(data)
  Object.assign(warnings, fieldWarnings)

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  }
}

/**
 * Validate a single field
 */
function validateField(
  field: keyof ConnectionFormData,
  value: any,
  rule: ValidationRule,
  formData: ConnectionFormData
): string | null {
  // Required validation
  if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return `${getFieldLabel(field)} is required`
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null
  }

  // String length validation
  if (typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      return `${getFieldLabel(field)} must be at least ${rule.minLength} characters`
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return `${getFieldLabel(field)} must be no more than ${rule.maxLength} characters`
    }
  }

  // Pattern validation
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return `${getFieldLabel(field)} format is invalid`
  }

  // Custom validation
  if (rule.custom) {
    const customError = rule.custom(value, formData)
    if (customError) {
      return customError
    }
  }

  return null
}

/**
 * Validate relationships between fields
 */
function validateCrossFields(data: ConnectionFormData): Record<string, string> {
  const errors: Record<string, string> = {}

  // If connection string is provided, some other fields become optional
  if (data.connectionString && data.connectionString.trim()) {
    // Validate connection string format
    const connectionStringError = validateConnectionString(data.connectionString, data.engine)
    if (connectionStringError) {
      errors.connectionString = connectionStringError
    }
  } else {
    // Ensure required fields are present when not using connection string
    if (!data.host && data.engine !== DatabaseEngine.BIGQUERY) {
      errors.host = 'Host is required when not using connection string'
    }
    if (!data.database) {
      errors.database = 'Database is required when not using connection string'
    }
  }

  // Validate port for specific engines
  if (data.port && data.engine) {
    const defaultPort = DEFAULT_PORTS[data.engine]
    if (data.port === defaultPort) {
      // This is fine, but we could add a warning
    }
  }

  return errors
}

/**
 * Generate warnings for the form
 */
function generateWarnings(data: ConnectionFormData): Record<string, string> {
  const warnings: Record<string, string> = {}

  // Warn about default ports
  if (data.port && data.engine) {
    const defaultPort = DEFAULT_PORTS[data.engine]
    if (data.port === defaultPort) {
      warnings.port = `Using default port ${defaultPort} for ${data.engine}`
    }
  }

  // Warn about SSL
  if (!data.ssl && data.engine !== DatabaseEngine.BIGQUERY) {
    warnings.ssl = 'Consider enabling SSL for secure connections'
  }

  // Warn about weak passwords
  if (data.password && data.password.length < 8) {
    warnings.password = 'Consider using a stronger password (8+ characters)'
  }

  return warnings
}

/**
 * Validate connection string format
 */
function validateConnectionString(connectionString: string, engine: DatabaseEngine): string | null {
  if (!connectionString || !connectionString.trim()) {
    return null
  }

  try {
    // Basic URL parsing
    const url = new URL(connectionString)
    
    // Check protocol matches engine
    const expectedProtocols = {
      [DatabaseEngine.POSTGRESQL]: ['postgresql', 'postgres'],
      [DatabaseEngine.MYSQL]: ['mysql'],
      [DatabaseEngine.BIGQUERY]: ['bigquery'],
      [DatabaseEngine.SNOWFLAKE]: ['snowflake'],
      [DatabaseEngine.SPARK_SQL]: ['spark']
    }

    const validProtocols = expectedProtocols[engine]
    if (validProtocols && !validProtocols.includes(url.protocol.replace(':', ''))) {
      return `Connection string protocol should be one of: ${validProtocols.join(', ')}`
    }

    return null
  } catch (error) {
    return 'Invalid connection string format'
  }
}

/**
 * Get user-friendly field label
 */
function getFieldLabel(field: keyof ConnectionFormData): string {
  const labels: Record<keyof ConnectionFormData, string> = {
    name: 'Connection Name',
    engine: 'Database Engine',
    host: 'Host',
    port: 'Port',
    database: 'Database',
    username: 'Username',
    password: 'Password',
    ssl: 'SSL',
    connectionString: 'Connection String'
  }
  return labels[field] || field
}

/**
 * Validate connection name uniqueness
 */
export function validateConnectionNameUniqueness(
  name: string, 
  existingNames: string[], 
  excludeId?: string
): string | null {
  const trimmedName = name.trim()
  if (!trimmedName) {
    return 'Connection name is required'
  }

  const isDuplicate = existingNames.some(existingName => 
    existingName.toLowerCase() === trimmedName.toLowerCase()
  )

  if (isDuplicate) {
    return 'A connection with this name already exists'
  }

  return null
}

/**
 * Get default values for a new connection
 */
export function getDefaultConnectionValues(engine?: DatabaseEngine): Partial<ConnectionFormData> {
  const defaults: Partial<ConnectionFormData> = {
    name: '',
    engine: engine || DatabaseEngine.POSTGRESQL,
    host: 'localhost',
    port: engine ? DEFAULT_PORTS[engine] : DEFAULT_PORTS[DatabaseEngine.POSTGRESQL],
    database: '',
    username: '',
    password: '',
    ssl: true,
    connectionString: ''
  }

  // Engine-specific defaults
  if (engine === DatabaseEngine.BIGQUERY) {
    defaults.host = ''
    defaults.port = DEFAULT_PORTS[DatabaseEngine.BIGQUERY]
    defaults.ssl = true
  } else if (engine === DatabaseEngine.SNOWFLAKE) {
    defaults.host = 'account.region.snowflakecomputing.com'
    defaults.port = DEFAULT_PORTS[DatabaseEngine.SNOWFLAKE]
    defaults.ssl = true
  }

  return defaults
}
