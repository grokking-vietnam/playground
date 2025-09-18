/**
 * Test for SQL Language Service functionality
 */

import { SQLLanguageService } from '../../services/SQLLanguageService';
import { SchemaProvider } from '../../services/SchemaProvider';
import { getDialectConfig } from '../../utils/sqlDialects';
import { DatabaseEngine } from '../../types/connections';

describe('SQLLanguageService', () => {
  const mockEngine = DatabaseEngine.BIGQUERY;

  let languageService: SQLLanguageService;
  let schemaProvider: SchemaProvider;

  beforeEach(() => {
    schemaProvider = new SchemaProvider();
    languageService = new SQLLanguageService(mockEngine, schemaProvider);
  });

  afterEach(() => {
    languageService.dispose();
  });

  test('should create language service with correct engine', () => {
    expect(languageService).toBeDefined();
  });

  test('should get dialect configuration for BigQuery', () => {
    const config = getDialectConfig(DatabaseEngine.BIGQUERY);
    
    expect(config.keywords).toContain('SELECT');
    expect(config.keywords).toContain('STRUCT');
    expect(config.dataTypes).toContain('STRING');
    expect(config.functions).toBeDefined();
  });

  test('should provide different configurations for different engines', () => {
    const bigQueryConfig = getDialectConfig(DatabaseEngine.BIGQUERY);
    const mysqlConfig = getDialectConfig(DatabaseEngine.MYSQL);
    const postgresConfig = getDialectConfig(DatabaseEngine.POSTGRESQL);

    // BigQuery specific
    expect(bigQueryConfig.keywords).toContain('STRUCT');
    expect(bigQueryConfig.dataTypes).toContain('STRING');

    // MySQL specific  
    expect(mysqlConfig.keywords).toContain('AUTO_INCREMENT');
    expect(mysqlConfig.dataTypes).toContain('TINYINT');

    // PostgreSQL specific
    expect(postgresConfig.keywords).toContain('SERIAL');
    expect(postgresConfig.dataTypes).toContain('JSONB');
  });

  test('should update engine correctly', () => {
    const newEngine = DatabaseEngine.MYSQL;

    expect(() => {
      languageService.updateEngine(newEngine);
    }).not.toThrow();
  });
});