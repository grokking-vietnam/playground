import * as monaco from 'monaco-editor';
import type { DatabaseEngine } from '../types/connections';

export interface SQLFormatOptions {
  indentSize: number;
  maxLineLength: number;
  keywordCase: 'upper' | 'lower' | 'capitalize';
  commaPosition: 'trailing' | 'leading';
  alignKeywords: boolean;
  preserveWhitespace: boolean;
}

export const DEFAULT_FORMAT_OPTIONS: SQLFormatOptions = {
  indentSize: 2,
  maxLineLength: 80,
  keywordCase: 'upper',
  commaPosition: 'trailing',
  alignKeywords: true,
  preserveWhitespace: false
};

export class SQLFormatter {
  private options: SQLFormatOptions;

  constructor(options: Partial<SQLFormatOptions> = {}) {
    this.options = { ...DEFAULT_FORMAT_OPTIONS, ...options };
  }

  /**
   * Format SQL text
   */
  format(sql: string, engine: DatabaseEngine): string {
    if (!sql || sql.trim().length === 0) {
      return sql;
    }

    try {
      return this.formatSQL(sql, engine);
    } catch (error) {
      console.warn('SQL formatting failed:', error);
      return sql; // Return original if formatting fails
    }
  }

  /**
   * Format SQL for Monaco editor
   */
  formatDocument(model: monaco.editor.ITextModel, engine: DatabaseEngine): { range: monaco.Range; text: string }[] {
    const sql = model.getValue();
    const formatted = this.format(sql, engine);
    
    if (formatted === sql) {
      return []; // No changes needed
    }

    return [
      {
        range: model.getFullModelRange(),
        text: formatted
      }
    ];
  }

  /**
   * Main SQL formatting logic
   */
  private formatSQL(sql: string, engine: DatabaseEngine): string {
    // Tokenize the SQL
    const tokens = this.tokenize(sql);
    
    // Parse and format
    return this.formatTokens(tokens, engine);
  }

  /**
   * Simple SQL tokenizer
   */
  private tokenize(sql: string): Token[] {
    const tokens: Token[] = [];
    let position = 0;
    const length = sql.length;

    while (position < length) {
      const char = sql[position];
      
      // Skip whitespace
      if (/\s/.test(char)) {
        const start = position;
        while (position < length && /\s/.test(sql[position])) {
          position++;
        }
        tokens.push({
          type: 'whitespace',
          value: sql.substring(start, position),
          position: start
        });
        continue;
      }

      // Handle comments
      if (char === '-' && sql[position + 1] === '-') {
        const start = position;
        while (position < length && sql[position] !== '\n') {
          position++;
        }
        tokens.push({
          type: 'comment',
          value: sql.substring(start, position),
          position: start
        });
        continue;
      }

      // Handle block comments
      if (char === '/' && sql[position + 1] === '*') {
        const start = position;
        position += 2;
        while (position < length - 1) {
          if (sql[position] === '*' && sql[position + 1] === '/') {
            position += 2;
            break;
          }
          position++;
        }
        tokens.push({
          type: 'comment',
          value: sql.substring(start, position),
          position: start
        });
        continue;
      }

      // Handle strings
      if (char === "'" || char === '"' || char === '`') {
        const quote = char;
        const start = position;
        position++;
        while (position < length) {
          if (sql[position] === quote) {
            if (sql[position + 1] === quote) {
              position += 2; // Escaped quote
              continue;
            }
            position++;
            break;
          }
          position++;
        }
        tokens.push({
          type: 'string',
          value: sql.substring(start, position),
          position: start
        });
        continue;
      }

      // Handle operators and punctuation
      if (/[(),.;=<>!+\-*/%]/.test(char)) {
        let operator = char;
        position++;
        
        // Check for multi-character operators
        if (position < length) {
          const nextChar = sql[position];
          const twoChar = char + nextChar;
          if (['<=', '>=', '!=', '<>', '||', '&&'].includes(twoChar)) {
            operator = twoChar;
            position++;
          }
        }
        
        tokens.push({
          type: 'operator',
          value: operator,
          position: position - operator.length
        });
        continue;
      }

      // Handle identifiers and keywords
      if (/[a-zA-Z_]/.test(char)) {
        const start = position;
        while (position < length && /[a-zA-Z0-9_]/.test(sql[position])) {
          position++;
        }
        const value = sql.substring(start, position);
        tokens.push({
          type: this.isKeyword(value) ? 'keyword' : 'identifier',
          value,
          position: start
        });
        continue;
      }

      // Handle numbers
      if (/[0-9]/.test(char)) {
        const start = position;
        while (position < length && /[0-9.]/.test(sql[position])) {
          position++;
        }
        tokens.push({
          type: 'number',
          value: sql.substring(start, position),
          position: start
        });
        continue;
      }

      // Unknown character - keep as is
      tokens.push({
        type: 'unknown',
        value: char,
        position: position
      });
      position++;
    }

    return tokens;
  }

  /**
   * Format the tokens into properly formatted SQL
   */
  private formatTokens(tokens: Token[], engine: DatabaseEngine): string {
    const result: string[] = [];
    let indentLevel = 0;
    let needsNewLine = false;
    let previousToken: Token | null = null;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = tokens[i + 1];

      // Skip original whitespace (we'll add our own)
      if (token.type === 'whitespace') {
        continue;
      }

      // Handle comments
      if (token.type === 'comment') {
        if (needsNewLine && result.length > 0) {
          result.push('\n' + this.getIndent(indentLevel));
        }
        result.push(token.value);
        needsNewLine = true;
        previousToken = token;
        continue;
      }

      // Handle keywords
      if (token.type === 'keyword') {
        const keyword = this.formatKeyword(token.value);
        
        // Add newlines for major keywords
        if (this.isMajorKeyword(keyword)) {
          if (result.length > 0 && !needsNewLine) {
            result.push('\n');
          }
          result.push(this.getIndent(indentLevel) + keyword);
          
          // Adjust indentation for certain keywords
          if (['SELECT', 'INSERT', 'UPDATE', 'DELETE'].includes(keyword)) {
            // No change to indent level
          } else if (['FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING'].includes(keyword)) {
            // Keep same level
          } else if (keyword === 'CASE') {
            indentLevel++;
          } else if (keyword === 'END') {
            indentLevel = Math.max(0, indentLevel - 1);
          }
          
          needsNewLine = false;
        } else {
          // Minor keywords - add space if needed
          if (result.length > 0 && !needsNewLine) {
            result.push(' ');
          }
          result.push(keyword);
        }
        
        previousToken = token;
        continue;
      }

      // Handle operators
      if (token.type === 'operator') {
        if (token.value === ',') {
          result.push(token.value);
          if (this.options.commaPosition === 'trailing') {
            result.push('\n' + this.getIndent(indentLevel + 1));
          }
          needsNewLine = false;
        } else if (token.value === '(') {
          result.push(token.value);
          indentLevel++;
          needsNewLine = false;
        } else if (token.value === ')') {
          indentLevel = Math.max(0, indentLevel - 1);
          result.push(token.value);
          needsNewLine = false;
        } else {
          // Other operators
          if (result.length > 0 && !needsNewLine) {
            result.push(' ');
          }
          result.push(token.value);
          if (nextToken && nextToken.type !== 'whitespace') {
            result.push(' ');
          }
        }
        
        previousToken = token;
        continue;
      }

      // Handle other tokens
      if (result.length > 0 && !needsNewLine && previousToken && 
          ['keyword', 'identifier'].includes(previousToken.type) && 
          ['keyword', 'identifier'].includes(token.type)) {
        result.push(' ');
      }

      result.push(token.value);
      needsNewLine = false;
      previousToken = token;
    }

    return result.join('').trim();
  }

  /**
   * Format keyword according to options
   */
  private formatKeyword(keyword: string): string {
    switch (this.options.keywordCase) {
      case 'upper':
        return keyword.toUpperCase();
      case 'lower':
        return keyword.toLowerCase();
      case 'capitalize':
        return keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
      default:
        return keyword.toUpperCase();
    }
  }

  /**
   * Check if a word is a SQL keyword
   */
  private isKeyword(word: string): boolean {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP',
      'ALTER', 'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA', 'COLUMN',
      'CONSTRAINT', 'PRIMARY', 'FOREIGN', 'KEY', 'UNIQUE', 'NOT', 'NULL',
      'DEFAULT', 'AND', 'OR', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'AS',
      'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'DISTINCT', 'ALL',
      'UNION', 'INTERSECT', 'EXCEPT', 'JOIN', 'INNER', 'LEFT', 'RIGHT',
      'FULL', 'OUTER', 'CROSS', 'ON', 'USING', 'ORDER', 'BY', 'GROUP',
      'HAVING', 'LIMIT', 'OFFSET', 'TOP', 'WITH', 'RECURSIVE'
    ];
    
    return keywords.includes(word.toUpperCase());
  }

  /**
   * Check if keyword should trigger a new line
   */
  private isMajorKeyword(keyword: string): boolean {
    const majorKeywords = [
      'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY',
      'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'
    ];
    
    return majorKeywords.includes(keyword.toUpperCase());
  }

  /**
   * Generate indentation string
   */
  private getIndent(level: number): string {
    return ' '.repeat(level * this.options.indentSize);
  }
}

interface Token {
  type: 'keyword' | 'identifier' | 'string' | 'number' | 'operator' | 'comment' | 'whitespace' | 'unknown';
  value: string;
  position: number;
}