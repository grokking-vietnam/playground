/**
 * Monaco Editor Configuration
 * 
 * Configures Monaco Editor to work properly with bundlers and suppress warnings.
 */

import * as monaco from 'monaco-editor'

// Configure Monaco Editor environment
self.MonacoEnvironment = {
  getWorker: function (workerId, label) {
    const getWorkerModule = (moduleUrl: string, fallbackUrl: string) => {
      return new Worker(self.MonacoEnvironment?.getWorkerUrl?.(moduleUrl, label) || fallbackUrl, {
        name: label,
        type: 'module',
      })
    }

    switch (label) {
      case 'json':
        return getWorkerModule(
          '/monaco-editor/esm/vs/language/json/json.worker.js',
          'data:text/javascript;charset=utf-8,' +
            encodeURIComponent(`
              self.MonacoEnvironment = {
                baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/'
              };
              importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/language/json/json.worker.js');`)
        )
      case 'css':
      case 'scss':
      case 'less':
        return getWorkerModule(
          '/monaco-editor/esm/vs/language/css/css.worker.js',
          'data:text/javascript;charset=utf-8,' +
            encodeURIComponent(`
              self.MonacoEnvironment = {
                baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/'
              };
              importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/language/css/css.worker.js');`)
        )
      case 'html':
      case 'handlebars':
      case 'razor':
        return getWorkerModule(
          '/monaco-editor/esm/vs/language/html/html.worker.js',
          'data:text/javascript;charset=utf-8,' +
            encodeURIComponent(`
              self.MonacoEnvironment = {
                baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/'
              };
              importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/language/html/html.worker.js');`)
        )
      case 'typescript':
      case 'javascript':
        return getWorkerModule(
          '/monaco-editor/esm/vs/language/typescript/ts.worker.js',
          'data:text/javascript;charset=utf-8,' +
            encodeURIComponent(`
              self.MonacoEnvironment = {
                baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/'
              };
              importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/language/typescript/ts.worker.js');`)
        )
      default:
        return getWorkerModule(
          '/monaco-editor/esm/vs/editor/editor.worker.js',
          'data:text/javascript;charset=utf-8,' +
            encodeURIComponent(`
              self.MonacoEnvironment = {
                baseUrl: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/'
              };
              importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/editor/editor.worker.js');`)
        )
    }
  },
}

/**
 * Initialize Monaco Editor with SQL language support
 */
export function initializeMonacoEditor() {
  // Register SQL language if not already registered
  const languages = monaco.languages.getLanguages()
  const sqlLanguage = languages.find(lang => lang.id === 'sql')
  
  if (!sqlLanguage) {
    monaco.languages.register({ id: 'sql' })
    
    // Configure SQL language
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
        { open: "'", close: "'" }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ]
    })

    // Set SQL monarch tokenizer
    monaco.languages.setMonarchTokensProvider('sql', {
      defaultToken: '',
      tokenPostfix: '.sql',
      ignoreCase: true,

      keywords: [
        'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
        'ON', 'AS', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET',
        'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE',
        'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA',
        'CONSTRAINT', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE',
        'NOT', 'NULL', 'DEFAULT', 'AUTO_INCREMENT', 'SERIAL', 'IDENTITY',
        'AND', 'OR', 'IN', 'LIKE', 'BETWEEN', 'EXISTS', 'IS', 'CASE',
        'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'COALESCE', 'NULLIF',
        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT', 'ALL', 'ANY',
        'UNION', 'EXCEPT', 'INTERSECT', 'WITH', 'RECURSIVE', 'CTE'
      ],

      operators: [
        '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
        '<>', '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|',
        '^', '%', '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=',
        '|=', '^=', '%=', '<<='
      ],

      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

      tokenizer: {
        root: [
          // identifiers and keywords
          [/[a-z_$][\w$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }],
          [/[A-Z][\w\$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'type.identifier'
            }
          }],

          // whitespace
          { include: '@whitespace' },

          // delimiters and operators
          [/[{}()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],

          // numbers
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/0[xX][0-9a-fA-F]+/, 'number.hex'],
          [/\d+/, 'number'],

          // delimiter: after number because of .\d floats
          [/[;,.]/, 'delimiter'],

          // strings
          [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
          [/'/, { token: 'string.quote', bracket: '@open', next: '@string' }],

          // characters
          [/'[^\\']'/, 'string'],
          [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
          [/'/, 'string.invalid']
        ],

        comment: [
          [/[^\/*]+/, 'comment'],
          [/\/\*/, 'comment', '@push'],    // nested comment
          ["\\*/", 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ],

        string: [
          [/[^\\']+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
        ],

        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment'],
          [/--.*$/, 'comment']
        ]
      }
    })
  }
}

export { monaco }
