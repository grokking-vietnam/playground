/**
 * Test for SQL Formatter functionality
 */

import { SQLFormatter } from '../../services/SQLFormatter';
import { DatabaseEngine } from '../../types/connections';

describe('SQLFormatter', () => {
  const mockEngine = DatabaseEngine.BIGQUERY;

  let formatter: SQLFormatter;

  beforeEach(() => {
    formatter = new SQLFormatter({
      keywordCase: 'upper',
      indentSize: 2
    });
  });

  test('should create formatter with default options', () => {
    const defaultFormatter = new SQLFormatter();
    expect(defaultFormatter).toBeDefined();
  });

  test('should format basic SQL query', () => {
    const sql = 'select * from customers where id = 1';
    
    const formatted = formatter.format(sql, mockEngine);
    
    expect(formatted).toBeDefined();
    expect(formatted).toContain('SELECT');
    expect(formatted).toContain('FROM');
    expect(formatted).toContain('WHERE');
  });

  test('should handle empty or invalid SQL', () => {
    expect(formatter.format('', mockEngine)).toBe('');
    expect(formatter.format('   ', mockEngine)).toBe('   ');
  });

  test('should preserve original SQL on formatting errors', () => {
    const sql = 'some invalid sql that causes formatting error';
    
    const formatted = formatter.format(sql, mockEngine);
    
    // Should return original if formatting fails
    expect(formatted).toBe(sql);
  });

  test('should format SQL with proper case conversion', () => {
    const upperFormatter = new SQLFormatter({ keywordCase: 'upper' });
    const lowerFormatter = new SQLFormatter({ keywordCase: 'lower' });
    
    const sql = 'select name from users';
    
    const upperFormatted = upperFormatter.format(sql, mockEngine);
    const lowerFormatted = lowerFormatter.format(sql, mockEngine);
    
    expect(upperFormatted).toContain('SELECT');
    expect(upperFormatted).toContain('FROM');
    
    expect(lowerFormatted).toContain('select');
    expect(lowerFormatted).toContain('from');
  });

  test('should handle complex SQL with joins and subqueries', () => {
    const sql = `
      select c.name, o.total 
      from customers c 
      inner join orders o on c.id = o.customer_id 
      where c.active = true 
      order by o.total desc
    `;
    
    const formatted = formatter.format(sql, mockEngine);
    
    expect(formatted).toBeDefined();
    expect(formatted).toContain('SELECT');
    expect(formatted).toContain('INNER JOIN');
    expect(formatted).toContain('ORDER BY');
  });
});