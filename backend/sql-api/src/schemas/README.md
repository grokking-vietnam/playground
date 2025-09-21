# JSON Schemas

This directory contains all JSON schemas used for API request/response validation. Each schema is defined in its own JSON file for better maintainability, portability, and tool compatibility.

## Directory Structure

```
schemas/
├── index.js                    # Central exports for all schemas
├── utils/                      # Schema utilities
│   └── load-json.js           # JSON file loading utility
├── request/                    # Request validation schemas
│   ├── connection-config.json  # Database connection configuration
│   ├── connection-test.json    # Connection test requests
│   ├── connection-schema.json  # Schema retrieval requests
│   ├── query-execute.json      # SQL query execution requests
│   ├── query-validate.json     # Query validation requests
│   └── query-cancel.json       # Query cancellation requests
└── response/                   # Response validation schemas
    ├── success.json            # Success response format
    ├── error.json              # Error response format
    ├── validation-error.json   # Validation error responses
    └── query-result.json       # Query execution results
```

## Benefits of JSON Schema Files

- **Portability**: JSON schemas can be used by any tool that supports JSON Schema
- **Tool Compatibility**: Works with IDEs, validators, and documentation generators
- **Version Control**: Better diff tracking and merge conflict resolution
- **Standards Compliance**: Follows JSON Schema specification exactly
- **Reusability**: Can be shared across different projects and languages

## Usage

### Importing Schemas

```javascript
// Import individual schemas
import { connectionConfigSchema } from './schemas/request/connection-config.js'
import { successResponseSchema } from './schemas/response/success.js'

// Import from central index
import { 
  queryExecuteRequestSchema,
  errorResponseSchema 
} from './schemas/index.js'
```

### Schema Features

- **JSON Schema Draft 7 compliant** - Follows official JSON Schema specification
- **Comprehensive validation** - String length, number ranges, pattern matching
- **Type coercion** - Automatic type conversion where appropriate
- **Detailed descriptions** - Each property includes helpful descriptions
- **Unique identifiers** - Each schema has a unique `$id` for reference

### TypeScript Type Generation

TypeScript types are automatically generated from the JSON schemas using the `json-schema-to-typescript` library:

```bash
# Generate TypeScript types from JSON schemas
npm run generate-types

# Or run the build command which includes type generation
npm run build
```

Generated types are available in `src/types/` and can be imported as:

```typescript
import { DatabaseConnectionConfiguration, QueryExecuteRequest } from './types/index.js'
```

## Schema Categories

### Request Schemas
- **Connection Config**: Database connection parameters
- **Query Execute**: SQL query execution with options
- **Query Validate**: Basic query syntax validation
- **Query Cancel**: Query cancellation by ID
- **Connection Test**: Database connectivity testing
- **Connection Schema**: Database schema information retrieval

### Response Schemas
- **Success**: Standard success response format
- **Error**: Standard error response format
- **Validation Error**: Detailed validation error information
- **Query Result**: SQL query execution results with metadata

## Maintenance

Each schema file is self-contained and includes:
- Schema definition with proper metadata
- Comprehensive property descriptions
- Validation rules and constraints
- Required field specifications

When modifying schemas:
1. Update the specific schema file
2. Ensure all tests still pass
3. Update documentation if needed
4. Consider backward compatibility
