/**
 * Enhanced SQL Editor component with advanced Monaco features
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import type { DatabaseEngine, EditorSettings, DatabaseSchema, SchemaUpdateEvent } from '../../types';
import { SQLLanguageService } from '../../services/SQLLanguageService';
import { SchemaProvider } from '../../services/SchemaProvider';
import { createEditorOptions, createSQLTheme, DEFAULT_EDITOR_SETTINGS } from '../../utils/editorConfig';
import { initializeMonacoEditor } from '../../utils/monacoConfig';

export interface EnhancedSQLEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  engine: DatabaseEngine;
  connectionId?: string;
  height?: string | number;
  width?: string | number;
  theme?: string;
  readOnly?: boolean;
  settings?: Partial<EditorSettings>;
  onValidationChange?: (errors: monaco.editor.IMarkerData[]) => void;
  onSchemaUpdate?: (schema: DatabaseSchema | null) => void;
  className?: string;
}

export function EnhancedSQLEditor({
  value,
  onChange,
  engine,
  connectionId,
  height = '100%',
  width = '100%',
  theme = 'vs',
  readOnly = false,
  settings = {},
  onValidationChange,
  onSchemaUpdate,
  className
}: EnhancedSQLEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const languageServiceRef = useRef<SQLLanguageService | null>(null);
  const schemaProviderRef = useRef<SchemaProvider | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [currentSchema, setCurrentSchema] = useState<DatabaseSchema | null>(null);

  const editorSettings = { ...DEFAULT_EDITOR_SETTINGS, ...settings };
  const editorOptions = createEditorOptions(editorSettings);

  /**
   * Initialize Monaco editor and language services
   */
  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
      editorRef.current = editor;

      // Initialize Monaco Editor with proper configuration
      initializeMonacoEditor();

      // Register custom SQL theme
      monacoInstance.editor.defineTheme('sql-theme', createSQLTheme());

      // Initialize schema provider if not exists
      if (!schemaProviderRef.current) {
        schemaProviderRef.current = new SchemaProvider();
      }

      // Initialize language service
      languageServiceRef.current = new SQLLanguageService(engine, schemaProviderRef.current);

      // Set up validation on content change
      const disposable = editor.onDidChangeModelContent(() => {
        if (languageServiceRef.current && editorRef.current) {
          const model = editorRef.current.getModel();
          if (model) {
            // Validate and set markers
            languageServiceRef.current.validateAndSetMarkers(model);

            // Get current markers for callback
            if (onValidationChange) {
              const markers = monacoInstance.editor.getModelMarkers({ resource: model.uri });
              onValidationChange(markers);
            }
          }
        }
      });

      // Subscribe to schema updates
      const schemaUnsubscribe = schemaProviderRef.current.subscribeToSchemaUpdates((event: SchemaUpdateEvent) => {
        setCurrentSchema(event.schema);
        onSchemaUpdate?.(event.schema);
      });

      // Load schema if connection ID is provided
      if (connectionId && languageServiceRef.current) {
        languageServiceRef.current.updateSchema(connectionId).then(() => {
          const schema = schemaProviderRef.current?.getCachedSchema(connectionId);
          if (schema) {
            setCurrentSchema(schema);
            onSchemaUpdate?.(schema);
          }
        });
      }

      setIsEditorReady(true);

      // Cleanup function
      return () => {
        disposable.dispose();
        schemaUnsubscribe();
      };
    },
    [engine, connectionId, onValidationChange, onSchemaUpdate]
  );

  /**
   * Update engine when it changes
   */
  useEffect(() => {
    if (isEditorReady && languageServiceRef.current) {
      languageServiceRef.current.updateEngine(engine);

      // Re-validate current content
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          languageServiceRef.current.validateAndSetMarkers(model);
        }
      }
    }
  }, [engine, isEditorReady]);

  /**
   * Update schema when connection changes
   */
  useEffect(() => {
    if (isEditorReady && languageServiceRef.current && connectionId) {
      languageServiceRef.current.updateSchema(connectionId).then(() => {
        const schema = schemaProviderRef.current?.getCachedSchema(connectionId);
        setCurrentSchema(schema || null);
        onSchemaUpdate?.(schema || null);

        // Re-validate with new schema
        if (editorRef.current) {
          const model = editorRef.current.getModel();
          if (model) {
            languageServiceRef.current!.validateAndSetMarkers(model);
          }
        }
      });
    }
  }, [connectionId, isEditorReady, onSchemaUpdate]);

  /**
   * Update editor options when settings change
   */
  useEffect(() => {
    if (editorRef.current) {
      const newOptions = createEditorOptions(editorSettings);
      editorRef.current.updateOptions(newOptions);
    }
  }, [editorSettings]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (languageServiceRef.current) {
        languageServiceRef.current.dispose();
      }
    };
  }, []);

  /**
   * Public methods for external access
   */
  const formatDocument = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  }, []);

  const focusEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const getEditorValue = useCallback(() => {
    return editorRef.current?.getValue() || '';
  }, []);

  const setEditorValue = useCallback((newValue: string) => {
    if (editorRef.current) {
      editorRef.current.setValue(newValue);
    }
  }, []);

  // Expose methods via ref for external access
  const methodsRef = useRef({
    formatDocument,
    focusEditor,
    getValue: getEditorValue,
    setValue: setEditorValue,
    getSchema: () => currentSchema,
    getEditor: () => editorRef.current
  });

  return (
    <div className={className} style={{ height, width }}>
      <Editor
        height="100%"
        width="100%"
        language="sql"
        theme={theme === 'sql-theme' ? 'sql-theme' : theme}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        options={{
          ...editorOptions,
          readOnly
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-gray-500">Loading enhanced SQL editor...</div>
          </div>
        }
      />
    </div>
  );
}

// Export additional utilities for external use
export { createEditorOptions, DEFAULT_EDITOR_SETTINGS } from '../../utils/editorConfig';
export type { EditorSettings, DatabaseEngine, DatabaseSchema } from '../../types';