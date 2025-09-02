import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, History, Settings } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const QueryEditor: React.FC<QueryEditorProps> = ({ value, onChange }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure SQL language support
    monaco.languages.sql?.setLanguageConfiguration?.('sql', {
      comments: {
        lineComment: '--',
        blockComment: ['/*', '*/'],
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: '`', close: '`' },
      ],
    });
  };

  const handleRunQuery = async () => {
    if (!value.trim()) return;
    
    setIsRunning(true);
    
    // Add to history
    setQueryHistory(prev => [value, ...prev.slice(0, 9)]); // Keep last 10 queries
    
    // Simulate query execution
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  const handleSaveQuery = () => {
    // In a real app, this would save to a backend
    console.log('Saving query:', value);
  };

  const formatQuery = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Query Editor Header */}
      <div className="border-b bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">SQL Query Editor</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={formatQuery}
            >
              <Settings className="h-4 w-4 mr-1" />
              Format
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveQuery}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button
              size="sm"
              onClick={handleRunQuery}
              disabled={isRunning}
            >
              <Play className="h-4 w-4 mr-1" />
              {isRunning ? 'Running...' : 'Run Query'}
            </Button>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={value}
          onChange={(newValue) => onChange(newValue || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            theme: 'vs',
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'all',
            contextmenu: true,
            mouseWheelZoom: true,
          }}
        />
      </div>

      {/* Query History Sidebar */}
      {queryHistory.length > 0 && (
        <div className="border-t bg-gray-50 p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4" />
                Recent Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {queryHistory.slice(0, 3).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => onChange(query)}
                    className="w-full text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 truncate"
                  >
                    {query.split('\n')[0].replace(/^--\s*/, '') || 'Untitled Query'}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QueryEditor;
