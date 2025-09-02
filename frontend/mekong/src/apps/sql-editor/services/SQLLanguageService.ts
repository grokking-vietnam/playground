/**
 * SQL Language Service for Monaco Editor
 * Provides syntax highlighting, autocomplete, hover info, and validation
 */

import * as monaco from 'monaco-editor';
import type {
  DatabaseEngine,
  DatabaseSchema,
  CompletionContext,
  HoverContext,
  ValidationContext,
  SQLFunction
} from '../types/editor';
import { SchemaProvider } from './SchemaProvider';
import { SQLFormatter } from './SQLFormatter';
import { SQLValidator } from './SQLValidator';
import { getDialectConfig } from '../utils/sqlDialects';
import { getCompletionItemKind, SQL_TRIGGER_CHARACTERS, DEBOUNCE_DELAY } from '../utils/editorConfig';

export class SQLLanguageService {
  private schemaProvider: SchemaProvider;
  private formatter: SQLFormatter;
  private validator: SQLValidator;
  private currentEngine: DatabaseEngine;
  private currentSchema?: DatabaseSchema;
  private registeredProviders: monaco.IDisposable[] = [];
  private validationTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(engine: DatabaseEngine, schemaProvider?: SchemaProvider) {
    this.currentEngine = engine;
    this.schemaProvider = schemaProvider || new SchemaProvider();
    this.formatter = new SQLFormatter();
    this.validator = new SQLValidator();
    
    this.registerLanguageProviders();
  }

  /**
   * Update the database engine and re-register providers
   */
  updateEngine(engine: DatabaseEngine): void {
    this.currentEngine = engine;
    this.disposeProviders();
    this.registerLanguageProviders();
  }

  /**
   * Update the database schema
   */
  async updateSchema(connectionId: string): Promise<void> {
    try {
      this.currentSchema = await this.schemaProvider.fetchSchema(connectionId);
    } catch (error) {
      console.warn('Failed to fetch schema:', error);
      this.currentSchema = undefined;
    }
  }

  /**
   * Register all Monaco language providers
   */
  private registerLanguageProviders(): void {
    const languageId = 'sql';

    // Completion provider (autocomplete)
    this.registeredProviders.push(
      monaco.languages.registerCompletionItemProvider(languageId, {
        triggerCharacters: SQL_TRIGGER_CHARACTERS,
        provideCompletionItems: (model, position) => 
          this.provideCompletionItems({ model, position, engine: this.currentEngine, schema: this.currentSchema })
      })
    );

    // Hover provider
    this.registeredProviders.push(
      monaco.languages.registerHoverProvider(languageId, {
        provideHover: (model, position) =>
          this.provideHover({ model, position, engine: this.currentEngine, schema: this.currentSchema })
      })
    );

    // Document formatting provider
    this.registeredProviders.push(
      monaco.languages.registerDocumentFormattingEditProvider(languageId, {
        provideDocumentFormattingEdits: (model) =>
          this.formatter.formatDocument(model, this.currentEngine)
      })
    );

    // Signature help provider
    this.registeredProviders.push(
      monaco.languages.registerSignatureHelpProvider(languageId, {
        signatureHelpTriggerCharacters: ['(', ','],
        provideSignatureHelp: (model, position) =>
          this.provideSignatureHelp({ model, position, engine: this.currentEngine, schema: this.currentSchema })
      })
    );

    // Configure SQL language features
    this.configureSQLLanguage();
  }

  /**
   * Configure SQL language tokens and syntax highlighting
   */
  private configureSQLLanguage(): void {
    const dialectConfig = getDialectConfig(this.currentEngine.dialect);
    
    monaco.languages.setLanguageConfiguration('sql', {
      comments: {
        lineComment: '--',
        blockComment: ['/*', '*/']
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: '`', close: '`' }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: '`', close: '`' }
      ]
    });

    // Set up syntax highlighting
    monaco.languages.setMonarchTokensProvider('sql', {
      tokenizer: {
        root: [
          // Keywords
          [new RegExp(`\\b(?:${dialectConfig.keywords?.join('|') || ''})\\b`, 'i'), 'keyword'],
          
          // Data types
          [new RegExp(`\\b(?:${dialectConfig.dataTypes?.join('|') || ''})\\b`, 'i'), 'type'],
          
          // Strings
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/'/, 'string', '@string'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@dstring'],
          [/`/, 'string', '@bstring'],
          
          // Numbers
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/\d+/, 'number'],
          
          // Comments
          [/--.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
          
          // Operators
          [/[=<>!%&+\-*/|^~]/, 'operator'],
          
          // Delimiters
          [/[;,.]/, 'delimiter'],
          
          // Parentheses
          [/[(){}[\]]/, '@brackets'],
          
          // Identifiers
          [/[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier']
        ],
        
        string: [
          [/[^\\']+/, 'string'],
          [/\\./, 'string.escape'],
          [/'/, 'string', '@pop']
        ],
        
        dstring: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, 'string', '@pop']
        ],
        
        bstring: [
          [/[^\\`]+/, 'string'],
          [/\\./, 'string.escape'],
          [/`/, 'string', '@pop']
        ],
        
        comment: [
          [/[^/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[/*]/, 'comment']
        ]
      }
    });
  }

  /**
   * Provide completion items (autocomplete)
   */
  private provideCompletionItems(context: CompletionContext): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    const { model, position, schema, engine } = context;
    const word = model.getWordUntilPosition(position);
    const range = new monaco.Range(
      position.lineNumber,
      word.startColumn,
      position.lineNumber,
      word.endColumn
    );
    const suggestions: monaco.languages.CompletionItem[] = [];

    // Get dialect configuration
    const dialectConfig = getDialectConfig(engine.dialect);

    // Add keywords
    if (dialectConfig.keywords) {
      dialectConfig.keywords.forEach(keyword => {
        suggestions.push({
          label: keyword,
          kind: getCompletionItemKind('keyword'),
          insertText: keyword,
          detail: 'SQL Keyword',
          sortText: `1_${keyword}`, // Sort keywords first
          range
        });
      });
    }

    // Add data types
    if (dialectConfig.dataTypes) {
      dialectConfig.dataTypes.forEach(type => {
        suggestions.push({
          label: type,
          kind: getCompletionItemKind('type'),
          insertText: type,
          detail: 'Data Type',
          sortText: `2_${type}`,
          range
        });
      });
    }

    // Add functions
    if (dialectConfig.functions) {
      dialectConfig.functions.forEach(func => {
        suggestions.push({
          label: func.name,
          kind: getCompletionItemKind('function'),
          insertText: `${func.name}($1)`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: func.returnType,
          documentation: {
            value: `**${func.name}**\n\n${func.description}\n\n\`\`\`sql\n${func.syntax}\n\`\`\``
          },
          sortText: `3_${func.name}`,
          range
        });
      });
    }

    // Add schema-based suggestions
    if (schema) {
      // Add tables
      schema.tables.forEach(table => {
        suggestions.push({
          label: table.name,
          kind: getCompletionItemKind('table'),
          insertText: table.name,
          detail: `${table.type} - ${table.database}.${table.schema}`,
          documentation: {
            value: table.description || `Table with ${table.columns.length} columns`
          },
          sortText: `4_${table.name}`,
          range
        });
      });

      // Add columns (context-aware)
      const currentContext = this.getCurrentContext(model, position);
      if (currentContext.tables.length > 0) {
        currentContext.tables.forEach(tableName => {
          const table = schema.tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
          if (table) {
            table.columns.forEach(column => {
              suggestions.push({
                label: column.name,
                kind: getCompletionItemKind('column'),
                insertText: column.name,
                detail: `${column.dataType} - ${table.name}.${column.name}`,
                documentation: {
                  value: column.description || `Column of type ${column.dataType}`
                },
                sortText: `5_${column.name}`,
                range
              });
            });
          }
        });
      }
    }

    return {
      suggestions: suggestions.filter(s => {
        const label = typeof s.label === 'string' ? s.label : s.label.label;
        return label.toLowerCase().includes(word.word.toLowerCase());
      })
    };
  }

  /**
   * Provide hover information
   */
  private provideHover(context: HoverContext): monaco.languages.ProviderResult<monaco.languages.Hover> {
    const { model, position, schema, engine } = context;
    const word = model.getWordAtPosition(position);
    
    if (!word) return null;

    const wordValue = word.word.toLowerCase();

    // Check for function information
    const dialectConfig = getDialectConfig(engine.dialect);
    const func = dialectConfig.functions?.find(f => f.name.toLowerCase() === wordValue);
    
    if (func) {
      return {
        range: new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        ),
        contents: [
          { value: `**${func.name}**` },
          { value: func.description },
          { value: `**Returns:** ${func.returnType}` },
          { value: `\`\`\`sql\n${func.syntax}\n\`\`\`` }
        ]
      };
    }

    // Check for table/column information
    if (schema) {
      const table = schema.tables.find(t => t.name.toLowerCase() === wordValue);
      if (table) {
        return {
          range: new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn
          ),
          contents: [
            { value: `**${table.name}** (${table.type})` },
            { value: table.description || 'Database table' },
            { value: `**Columns:** ${table.columns.length}` },
            { value: `**Schema:** ${table.database}.${table.schema}` }
          ]
        };
      }

      // Check for column
      const column = schema.columns.find(c => c.name.toLowerCase() === wordValue);
      if (column) {
        return {
          range: new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn
          ),
          contents: [
            { value: `**${column.name}**` },
            { value: column.description || 'Database column' },
            { value: `**Type:** ${column.dataType}` },
            { value: `**Nullable:** ${column.nullable ? 'Yes' : 'No'}` },
            { value: column.primaryKey ? '**Primary Key**' : '' }
          ].filter(c => c.value)
        };
      }
    }

    return null;
  }

  /**
   * Provide signature help for functions
   */
  private provideSignatureHelp(context: CompletionContext): monaco.languages.ProviderResult<monaco.languages.SignatureHelpResult> {
    const { model, position, engine } = context;
    
    // Find the function call at the current position
    const line = model.getLineContent(position.lineNumber);
    const beforeCursor = line.substring(0, position.column - 1);
    
    // Simple regex to find function name before opening parenthesis
    const match = beforeCursor.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\((?:[^()]*(?:\([^()]*\))*[^()]*)*$/);
    
    if (!match) return null;

    const funcName = match[1].toLowerCase();
    const dialectConfig = getDialectConfig(engine.dialect);
    const func = dialectConfig.functions?.find(f => f.name.toLowerCase() === funcName);

    if (!func) return null;

    return {
      value: {
        signatures: [{
          label: func.syntax,
          documentation: {
            value: func.description
          },
          parameters: func.parameters.map(param => ({
            label: param.name,
            documentation: {
              value: `${param.type}${param.optional ? ' (optional)' : ''}\n${param.description || ''}`
            }
          }))
        }],
        activeSignature: 0,
        activeParameter: 0 // Could calculate based on comma count
      },
      dispose: () => {} // Add dispose method
    };
  }

  /**
   * Validate SQL and set markers
   */
  validateAndSetMarkers(model: monaco.editor.ITextModel): void {
    const modelUri = model.uri.toString();
    
    // Clear existing timeout
    if (this.validationTimeouts.has(modelUri)) {
      clearTimeout(this.validationTimeouts.get(modelUri)!);
    }

    // Debounce validation
    const timeout = setTimeout(() => {
      const markers = this.validator.validateSyntax(model, this.currentEngine, this.currentSchema);
      monaco.editor.setModelMarkers(model, 'sql', markers);
      this.validationTimeouts.delete(modelUri);
    }, DEBOUNCE_DELAY.VALIDATION);

    this.validationTimeouts.set(modelUri, timeout);
  }

  /**
   * Get current SQL context (tables, aliases, etc.)
   */
  private getCurrentContext(model: monaco.editor.ITextModel, position: monaco.Position): { tables: string[]; aliases: Map<string, string> } {
    const sql = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    });

    const tables: string[] = [];
    const aliases = new Map<string, string>();

    // Simple regex to find FROM and JOIN clauses
    const fromMatch = sql.match(/FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+(?:AS\s+)?([a-zA-Z_][a-zA-Z0-9_]*))?/gi);
    const joinMatch = sql.match(/JOIN\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+(?:AS\s+)?([a-zA-Z_][a-zA-Z0-9_]*))?/gi);

    [fromMatch, joinMatch].forEach(matches => {
      if (matches) {
        matches.forEach(match => {
          const parts = match.split(/\s+/);
          if (parts.length >= 2) {
            const tableName = parts[1];
            tables.push(tableName);
            
            // Check for alias
            if (parts.length >= 3 && parts[2].toUpperCase() !== 'ON') {
              const alias = parts[parts.length - 1];
              aliases.set(alias, tableName);
            }
          }
        });
      }
    });

    return { tables, aliases };
  }

  /**
   * Dispose all registered providers
   */
  private disposeProviders(): void {
    this.registeredProviders.forEach(provider => provider.dispose());
    this.registeredProviders = [];
    
    // Clear validation timeouts
    this.validationTimeouts.forEach(timeout => clearTimeout(timeout));
    this.validationTimeouts.clear();
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.disposeProviders();
  }
}