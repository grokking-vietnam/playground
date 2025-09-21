# SQL Editor Backend API

A robust, production-ready Node.js backend API for the SQL Editor frontend, providing secure PostgreSQL database connectivity with comprehensive testing, JSON Schema validation, and modern architecture patterns.

## 🚀 Features

- **JSON Schema Validation**: Modern validation using AJV instead of express-validator
- **Comprehensive Testing**: Unit and integration tests with Jest
- **Controller Architecture**: Clean separation of concerns with dedicated controllers
- **Real PostgreSQL Connectivity**: Direct connection to PostgreSQL databases with connection pooling
- **Query Management**: Execute, cancel, and validate SQL queries with safety checks
- **Schema Discovery**: Retrieve detailed database schema and table information
- **Security First**: Rate limiting, input sanitization, and query safety validation
- **Production Ready**: Comprehensive error handling, logging, and monitoring endpoints

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with modern middleware
- **Database**: PostgreSQL (via `pg` driver with connection pooling)
- **Validation**: AJV (JSON Schema) with format validation
- **Testing**: Jest with Supertest for integration testing
- **Security**: Helmet, CORS, Rate limiting, Input sanitization
- **Development**: Nodemon, Babel for ES modules

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL database (for testing connections)
- pnpm package manager

## 🔧 Installation

1. **Navigate to the API directory**:
```bash
cd backend/sql-api
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Environment Setup**:
```bash
cp env.example .env
cp env.test.example .env.test
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=3001

# Database Connection Limits
MAX_QUERY_TIMEOUT=30000
MAX_RESULT_ROWS=10000

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Security
DISABLE_RATE_LIMITING=false
```

## 🚀 Usage

### Development
```bash
pnpm run dev
```
Server runs on `http://localhost:3001` with hot reloading.

### Production
```bash
pnpm start
```

### Testing
```bash
# Run all tests
pnpm test

# Run with coverage
ppnpm run test:coverage

# Run only unit tests
ppnpm run test:unit

# Run only integration tests
ppnpm run test:integration

# Watch mode for development
ppnpm run test:watch
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
Currently no authentication required. Add your auth middleware as needed.

---

## 🔍 Query Endpoints

### Execute SQL Query
```http
POST /api/query/execute
Content-Type: application/json

{
  "query": "SELECT id, name, email FROM users WHERE active = true LIMIT 10",
  "connectionId": "prod-db-connection",
  "connection": {
    "host": "localhost",
    "port": 5432,
    "database": "myapp",
    "username": "dbuser",
    "password": "secure_password",
    "ssl": false
  },
  "options": {
    "timeout": 30000,
    "maxRows": 1000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queryId": "550e8400-e29b-41d4-a716-446655440000",
    "columns": [
      {"name": "id", "type": "integer", "nullable": false},
      {"name": "name", "type": "text", "nullable": true},
      {"name": "email", "type": "varchar", "nullable": false}
    ],
    "rows": [
      {"id": 1, "name": "John Doe", "email": "john@example.com"},
      {"id": 2, "name": "Jane Smith", "email": "jane@example.com"}
    ],
    "metadata": {
      "totalRows": 2,
      "affectedRows": 0,
      "executionTime": 45,
      "command": "SELECT",
      "hasMore": false,
      "actualRowCount": 2
    }
  },
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### Cancel Running Query
```http
POST /api/query/cancel

{
  "queryId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Validate Query Syntax
```http
POST /api/query/validate

{
  "query": "SELECT * FROM users WHERE id = $1"
}
```

### Get Active Queries
```http
GET /api/query/active
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 2,
    "queries": [
      {
        "queryId": "550e8400-e29b-41d4-a716-446655440000",
        "query": "SELECT * FROM large_table WHERE...",
        "startTime": 1701942600000,
        "duration": 5000
      }
    ]
  },
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

---

## 🔗 Connection Endpoints

### Test Database Connection
```http
POST /api/connection/test

{
  "host": "localhost",
  "port": 5432,
  "database": "myapp",
  "username": "dbuser",
  "password": "secure_password",
  "ssl": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "PostgreSQL 14.9 on x86_64-pc-linux-gnu",
    "currentTime": "2023-12-07T10:30:00.000Z",
    "latency": 0
  },
  "message": "Connection test successful",
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### Get Database Schema
```http
POST /api/connection/schema

{
  "connectionId": "prod-db-connection",
  "connection": {
    "host": "localhost",
    "port": 5432,
    "database": "myapp",
    "username": "dbuser",
    "password": "secure_password"
  }
}
```

### Get Connection Pool Status
```http
GET /api/connection/pools
```

### Close Connection Pool
```http
DELETE /api/connection/pools/{connectionId}
```

### Get Table Details
```http
POST /api/connection/table/{schema}/{table}

{
  "connectionId": "prod-db-connection",
  "connection": { ... }
}
```

---

## 🏥 Health & Monitoring

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## 🛡️ Security Features

### Query Safety Validation
- **Dangerous Operations**: Blocks `DROP DATABASE`, `DROP SCHEMA`, `TRUNCATE TABLE`
- **Unsafe Queries**: Prevents `DELETE` and `UPDATE` without `WHERE` clauses
- **Query Limits**: Maximum query length (100,000 characters)
- **Execution Limits**: Configurable timeouts (1s - 5min)
- **Result Limits**: Maximum rows returned (1 - 50,000)

### Input Validation & Sanitization
- **JSON Schema Validation**: Comprehensive request validation using AJV
- **Type Coercion**: Automatic type conversion where appropriate
- **Input Sanitization**: Automatic trimming and normalization
- **Required Fields**: Strict validation of mandatory parameters
- **Format Validation**: UUID, email, date-time format checking

### Security Middleware
- **Rate Limiting**: Configurable per-IP request limits
- **CORS Protection**: Configurable allowed origins
- **Helmet Security**: Standard security headers
- **Input Size Limits**: Maximum request body size (10MB)

---

## 🧪 Testing

### Test Structure
```
tests/
├── setup.js                          # Global test configuration
├── unit/                             # Unit tests
│   ├── middleware/
│   │   └── validation.test.js        # Validation middleware tests
│   ├── services/
│   │   └── DatabaseService.test.js   # Database service tests
│   └── schemas/
│       └── index.test.js            # JSON schema tests
└── integration/                      # Integration tests
    └── routes/
        ├── query.test.js            # Query route tests
        └── connection.test.js       # Connection route tests
```

### Running Tests
```bash
# All tests with coverage
pnpm run test:coverage

# Specific test suites
pnpm run test:unit
pnpm run test:integration

# Watch mode for development
pnpm run test:watch
```

### Test Coverage
Current coverage targets:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

---

## 🏗️ Architecture

### Project Structure
```
src/
├── controllers/           # Business logic controllers
│   ├── QueryController.js      # Query operations
│   └── ConnectionController.js # Connection operations
├── middleware/           # Express middleware
│   ├── validation.js          # JSON Schema validation
│   ├── errorHandler.js        # Error handling
│   └── requestLogger.js       # Request logging
├── routes/              # API route definitions
│   ├── query.js              # Query endpoints
│   └── connection.js         # Connection endpoints
├── schemas/             # JSON Schema definitions
│   └── index.js              # Request/response schemas
├── services/            # Core business services
│   └── DatabaseService.js    # Database operations
└── server.js            # Application entry point
```

### Design Patterns

**Controller Pattern**: Separates route handling from business logic
```javascript
// Route definition
router.post('/execute', [
  sanitizeRequest,
  validateSchema(queryExecuteRequestSchema)
], queryController.executeQuery.bind(queryController))

// Controller method
async executeQuery(req, res, next) {
  // Business logic here
}
```

**Service Pattern**: Centralized database operations
```javascript
// Usage in controller
const result = await databaseService.executeQuery(
  connectionId, connection, query, options
)
```

**Schema-First Validation**: JSON Schema definitions drive validation
```javascript
export const queryExecuteRequestSchema = {
  type: 'object',
  properties: {
    query: { type: 'string', minLength: 1, maxLength: 100000 },
    // ... other properties
  },
  required: ['query', 'connectionId', 'connection']
}
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Validation |
|----------|-------------|---------|------------|
| `NODE_ENV` | Environment mode | `development` | `development\|production\|test` |
| `PORT` | Server port | `3001` | `1-65535` |
| `MAX_QUERY_TIMEOUT` | Query timeout (ms) | `30000` | `1000-300000` |
| `MAX_RESULT_ROWS` | Max rows returned | `10000` | `1-50000` |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:3000` | Comma-separated URLs |
| `DISABLE_RATE_LIMITING` | Disable rate limits | `false` | `true\|false` |

---

## 🚀 Production Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting appropriately
- [ ] Set up comprehensive logging
- [ ] Configure log rotation
- [ ] Set up health monitoring
- [ ] Configure database connection limits
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure environment-specific timeouts

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy source code
COPY src/ ./src/

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3001

CMD ["pnpm", "start"]
```

---

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `pnpm install`
4. Create feature branch: `git checkout -b feature/amazing-feature`
5. Make your changes
6. Add tests for new functionality
7. Run tests: `pnpm test`
8. Commit changes: `git commit -m 'Add amazing feature'`
9. Push to branch: `git push origin feature/amazing-feature`
10. Submit a Pull Request

### Code Standards
- **ES Modules**: Use import/export syntax
- **Async/Await**: Prefer over Promise chains
- **Error Handling**: Always use try/catch with proper error propagation
- **Testing**: Maintain 80%+ test coverage
- **Documentation**: Update README for new features
- **JSON Schema**: Define schemas for all new endpoints

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [AJV](https://ajv.js.org/) - JSON Schema validator
- [Jest](https://jestjs.io/) - Testing framework
- [PostgreSQL](https://www.postgresql.org/) - Database system
- [Node.js](https://nodejs.org/) - Runtime environment