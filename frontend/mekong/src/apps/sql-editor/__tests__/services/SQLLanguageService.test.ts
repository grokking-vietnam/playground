/**
 * Test for SQL Language Service functionality
 */

import { SQLLanguageService } from '../../services/SQLLanguageService';
import { SchemaProvider } from '../../services/SchemaProvider';
import { getDialectConfig } from '../../utils/sqlDialects';

describe('SQLLanguageService', () => {
  const mockEngine = {
    id: 'bigquery',
    name: 'BigQuery',
    dialect: 'bigquery',
    icon: null
  };

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
    const config = getDialectConfig('bigquery');
    
    expect(config.keywords).toContain('SELECT');
    expect(config.keywords).toContain('STRUCT');
    expect(config.dataTypes).toContain('STRING');
    expect(config.functions).toBeDefined();
  });

  test('should provide different configurations for different engines', () => {
    const bigQueryConfig = getDialectConfig('bigquery');
    const mysqlConfig = getDialectConfig('mysql');
    const postgresConfig = getDialectConfig('postgresql');

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
    const newEngine = {
      id: 'mysql',
      name: 'MySQL',
      dialect: 'mysql',
      icon: null
    };

    expect(() => {
      languageService.updateEngine(newEngine);
    }).not.toThrow();
  });
});