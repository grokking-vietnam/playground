/**
 * Monaco Editor configuration utilities
 */

import * as monaco from 'monaco-editor';
import type { EditorSettings } from '../types';

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  lineNumbers: true,
  autoComplete: true,
  syntaxHighlighting: true,
  errorHighlighting: true,
  formatOnType: false
};

export function createEditorOptions(settings: EditorSettings): monaco.editor.IStandaloneEditorConstructionOptions {
  return {
    fontSize: settings.fontSize,
    tabSize: settings.tabSize,
    insertSpaces: true,
    wordWrap: settings.wordWrap ? 'on' : 'off',
    minimap: { enabled: settings.minimap },
    lineNumbers: settings.lineNumbers ? 'on' : 'off',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    roundedSelection: false,
    theme: 'vs',
    
    // Enhanced SQL-specific options
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: 'on',
    accessibilitySupport: 'auto',
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoIndent: 'advanced',
    autoSurround: 'languageDefined',
    bracketPairColorization: { enabled: true },
    codeLens: false,
    colorDecorators: true,
    contextmenu: true,
    copyWithSyntaxHighlighting: true,
    cursorBlinking: 'blink',
    cursorSmoothCaretAnimation: 'off',
    dragAndDrop: true,
    emptySelectionClipboard: true,
    find: {
      addExtraSpaceOnTop: true,
      autoFindInSelection: 'never',
      seedSearchStringFromSelection: 'always'
    },
    folding: true,
    foldingStrategy: 'auto',
    fontLigatures: false,
    formatOnPaste: true,
    formatOnType: settings.formatOnType,
    glyphMargin: true,
    hideCursorInOverviewRuler: false,
    hover: { enabled: true, sticky: true },
    links: true,
    matchBrackets: 'always',
    mouseWheelZoom: false,
    multiCursorMergeOverlapping: true,
    multiCursorModifier: 'alt',
    overviewRulerBorder: true,
    overviewRulerLanes: 2,
    padding: { top: 10, bottom: 10 },
    parameterHints: { enabled: true },
    quickSuggestions: {
      other: settings.autoComplete,
      comments: false,
      strings: false
    },
    quickSuggestionsDelay: 100,
    renderControlCharacters: false,
    renderFinalNewline: 'on',
    renderLineHighlight: 'line',
    renderWhitespace: 'selection',
    selectOnLineNumbers: true,
    selectionHighlight: true,
    showFoldingControls: 'mouseover',
    smoothScrolling: false,
    snippetSuggestions: 'inline',
    suggest: {
      insertMode: 'insert',
      filterGraceful: true,
      localityBonus: true,
      shareSuggestSelections: false,
      showIcons: true,
      showStatusBar: true
    },
    suggestFontSize: settings.fontSize,
    suggestLineHeight: settings.fontSize + 4,
    suggestOnTriggerCharacters: true,
    suggestSelection: 'first',
    useTabStops: true,
    wordBasedSuggestions: 'matchingDocuments',
    wordWrapBreakAfterCharacters: '\t})]?|/&,;',
    wordWrapBreakBeforeCharacters: '[({+',
    wrappingIndent: 'indent',
    wrappingStrategy: 'advanced'
  };
}

export function createSQLTheme(): monaco.editor.IStandaloneThemeData {
  return {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword.sql', foreground: '0000ff', fontStyle: 'bold' },
      { token: 'string.sql', foreground: 'a31515' },
      { token: 'number.sql', foreground: '098658' },
      { token: 'comment.sql', foreground: '008000', fontStyle: 'italic' },
      { token: 'operator.sql', foreground: '000000' },
      { token: 'delimiter.sql', foreground: '000000' },
      { token: 'identifier.sql', foreground: '001188' },
      { token: 'type.sql', foreground: '267f99', fontStyle: 'bold' },
      { token: 'function.sql', foreground: '795e26' },
      { token: 'table.sql', foreground: '0070c1', fontStyle: 'bold' },
      { token: 'column.sql', foreground: '001188' }
    ],
    colors: {
      'editor.foreground': '#000000',
      'editor.background': '#ffffff',
      'editor.selectionBackground': '#add6ff4d',
      'editor.lineHighlightBackground': '#f5f5f5',
      'editorCursor.foreground': '#000000',
      'editorWhitespace.foreground': '#bfbfbf'
    }
  };
}

export function getCompletionItemKind(type: string): monaco.languages.CompletionItemKind {
  switch (type.toLowerCase()) {
    case 'table':
      return monaco.languages.CompletionItemKind.Struct;
    case 'column':
    case 'field':
      return monaco.languages.CompletionItemKind.Field;
    case 'function':
    case 'procedure':
      return monaco.languages.CompletionItemKind.Function;
    case 'keyword':
      return monaco.languages.CompletionItemKind.Keyword;
    case 'operator':
      return monaco.languages.CompletionItemKind.Operator;
    case 'type':
    case 'datatype':
      return monaco.languages.CompletionItemKind.TypeParameter;
    case 'schema':
    case 'database':
      return monaco.languages.CompletionItemKind.Module;
    case 'variable':
      return monaco.languages.CompletionItemKind.Variable;
    case 'value':
      return monaco.languages.CompletionItemKind.Value;
    default:
      return monaco.languages.CompletionItemKind.Text;
  }
}

export const SQL_TRIGGER_CHARACTERS = ['.', ' ', '(', ',', '\n'];

export const DEBOUNCE_DELAY = {
  VALIDATION: 500,
  COMPLETION: 100,
  HOVER: 200
} as const;