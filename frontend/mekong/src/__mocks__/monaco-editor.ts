/**
 * Mock for Monaco Editor
 */

export const languages = {
  register: jest.fn(),
  setMonarchTokensProvider: jest.fn(),
  setLanguageConfiguration: jest.fn(),
  registerCompletionItemProvider: jest.fn(() => ({ dispose: jest.fn() })),
  registerHoverProvider: jest.fn(() => ({ dispose: jest.fn() })),
  registerSignatureHelpProvider: jest.fn(() => ({ dispose: jest.fn() })),
  registerDocumentFormattingEditProvider: jest.fn(() => ({ dispose: jest.fn() })),
  getLanguages: jest.fn(() => []),
  sql: {
    CompletionItemKind: {
      Function: 'Function',
      Keyword: 'Keyword',
      Variable: 'Variable',
      Operator: 'Operator',
    }
  }
};

export const editor = {
  create: jest.fn(),
  defineTheme: jest.fn(),
  setTheme: jest.fn(),
  getModel: jest.fn(),
  getModels: jest.fn(() => []),
  createModel: jest.fn(),
};

export const Range = jest.fn();

export const Position = jest.fn();

export const Uri = {
  parse: jest.fn(),
  file: jest.fn(),
};

// Default export
const monaco = {
  languages,
  editor,
  Range,
  Position,
  Uri,
};

export default monaco;