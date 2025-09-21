# SQL Editor Backend API

Backend service providing real PostgreSQL database connectivity for the SQL Editor frontend.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend/sql-api
npm install
```

### 2. Configure Environment
```bash
cp env.example .env
# Edit .env with your database credentials
```

### 3. Start Development Server
```bash
npm run dev
```

The API server will start on `http://localhost:3001`

## 📋 Environment Configuration

Create a `.env` file with your PostgreSQL connection details:

```env
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=your_database_name
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password

# Server Configuration
PORT=3001
NODE_ENV=development

# Security
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Query Limits
MAX_QUERY_TIMEOUT=30000
MAX_RESULT_ROWS=10000
```

## 🔌 API Endpoints

### Query Execution
- `POST /api/query/execute` - Execute SQL query
- `POST /api/query/cancel` - Cancel running query
- `POST /api/query/validate` - Validate SQL syntax

### Connection Management
- `POST /api/connection/test` - Test database connection
- `POST /api/connection/schema` - Get database schema

### Health Check
- `GET /health` - Server health status

## 🧪 Testing the API

### Test Connection
```bash
curl -X POST http://localhost:3001/api/connection/test \
  -H "Content-Type: application/json" \
  -d '{
    "host": "localhost",
    "port": 5432,
    "database": "test",
    "username": "postgres",
    "password": "password"
  }'
```

### Execute Query
```bash
curl -X POST http://localhost:3001/api/query/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT count(*) FROM users",
    "connectionId": "test-connection",
    "connection": {
      "host": "localhost",
      "port": 5432,
      "database": "test",
      "username": "postgres",
      "password": "password"
    }
  }'
```

## 🔒 Security Features

- **Query Validation**: Blocks dangerous operations (DROP, TRUNCATE without WHERE)
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **SQL Injection Prevention**: Uses parameterized queries
- **Timeout Protection**: Configurable query execution timeouts

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/API    ┌─────────────────┐    PostgreSQL    ┌─────────────────┐
│   Frontend      │───────────────▶│   Backend API   │─────────────────▶│   PostgreSQL    │
│   (Browser)     │                │   (Node.js)     │                  │   Database      │
│                 │◀───────────────│                 │◀─────────────────│                 │
└─────────────────┘    JSON        └─────────────────┘    SQL Results   └─────────────────┘
```

## 📝 Development

### Start in Development Mode
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

### Production Deployment
```bash
npm start
```

## 🐛 Troubleshooting

### Connection Issues
1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure database accepts connections from your IP
4. Check firewall settings

### CORS Issues
1. Add your frontend URL to `CORS_ORIGINS` in `.env`
2. Restart the API server after changes

### Query Timeouts
1. Increase `MAX_QUERY_TIMEOUT` for complex queries
2. Optimize your SQL queries
3. Check database performance

## 📊 Monitoring

The API includes built-in logging for:
- Request/response timing
- Query execution metrics
- Error tracking
- Connection pool status

Check the console output for real-time monitoring information.
