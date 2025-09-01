import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Editor from "@monaco-editor/react"
import {
  Save,
  FolderOpen,
  FileText,
  Play,
  Settings,
  Download,
  Upload,
  Copy,
  Scissors,
  RotateCcw,
  RotateCw,
  Search,
  Code,
  Terminal,
  GitBranch,
} from "lucide-react"

// Define types for better TypeScript support
type FileMap = Record<string, string>

export default function CodeEditorApp() {
  const [activeFile, setActiveFile] = useState<string>("main.sql")
  const [files, setFiles] = useState<FileMap>({
    "main.sql": `-- Welcome to Code Editor
-- This is a powerful code editor with syntax highlighting

SELECT 
    user_id,
    user_name,
    email,
    created_at,
    last_login
FROM users 
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 100;`,
    "script.py": `# Python Script Example
import pandas as pd
import numpy as np

def analyze_data(data):
    """Analyze user data and return insights"""
    
    # Basic statistics
    total_users = len(data)
    active_users = data[data['status'] == 'active'].shape[0]
    
    print(f"Total users: {total_users}")
    print(f"Active users: {active_users}")
    
    return {
        'total': total_users,
        'active': active_users,
        'activation_rate': active_users / total_users
    }

# Example usage
if __name__ == "__main__":
    # Load your data here
    results = analyze_data(user_data)
    print(results)`,
    "config.json": `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "analytics_db",
    "ssl": true
  },
  "api": {
    "version": "v1",
    "timeout": 30000,
    "retries": 3
  },
  "features": {
    "analytics": true,
    "reporting": true,
    "monitoring": true
  }
}`,
  })
  
  const [theme, setTheme] = useState<string>("vs-dark")
  const [language, setLanguage] = useState<string>("sql")

  const getLanguageFromFile = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'sql': return 'sql'
      case 'py': return 'python'
      case 'js': return 'javascript'
      case 'ts': return 'typescript'
      case 'json': return 'json'
      case 'yaml': case 'yml': return 'yaml'
      case 'html': return 'html'
      case 'css': return 'css'
      case 'md': return 'markdown'
      default: return 'plaintext'
    }
  }

  const handleFileChange = (filename: string) => {
    setActiveFile(filename)
    setLanguage(getLanguageFromFile(filename))
  }

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFiles(prev => ({
        ...prev,
        [activeFile]: value
      }))
    }
  }

  const createNewFile = (ext: string, name: string) => {
    const newFilename = `new_file_${Date.now()}.${ext}`
    const template = getFileTemplate(ext)
    setFiles(prev => ({
      ...prev,
      [newFilename]: template
    }))
    handleFileChange(newFilename)
  }

  const getFileTemplate = (ext: string): string => {
    switch (ext) {
      case 'sql': return '-- New SQL Query\nSELECT * FROM table_name;\n'
      case 'py': return '# New Python Script\nprint("Hello, World!")\n'
      case 'js': return '// New JavaScript File\nconsole.log("Hello, World!");\n'
      case 'json': return '{\n  "key": "value"\n}\n'
      default: return '// New file\n'
    }
  }

  // Get current file content safely
  const getCurrentFileContent = (): string => {
    return files[activeFile] || ''
  }

  const fileTypes = [
    { ext: 'sql', name: 'SQL Query', icon: <Code className="h-4 w-4" /> },
    { ext: 'py', name: 'Python Script', icon: <FileText className="h-4 w-4" /> },
    { ext: 'js', name: 'JavaScript', icon: <Code className="h-4 w-4" /> },
    { ext: 'json', name: 'JSON Config', icon: <Settings className="h-4 w-4" /> },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Code Editor</h2>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* File Explorer */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">Files</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <FolderOpen className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <FileText className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              {Object.keys(files).map((filename) => (
                <button
                  key={filename}
                  onClick={() => handleFileChange(filename)}
                  className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-accent transition-colors ${
                    activeFile === filename ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {filename}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Quick Actions</h3>
            {fileTypes.map((type) => (
              <Button
                key={type.ext}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => createNewFile(type.ext, type.name)}
              >
                {type.icon}
                New {type.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-border bg-card px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{activeFile}</span>
                <span className="text-xs text-muted-foreground uppercase">
                  {language}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="text-xs border border-border rounded px-2 py-1 bg-background"
              >
                <option value="vs-light">Light</option>
                <option value="vs-dark">Dark</option>
                <option value="hc-black">High Contrast</option>
              </select>
              
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-1" />
                Find
              </Button>
              
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              
              <Button size="sm" className="bg-primary">
                <Play className="h-4 w-4 mr-1" />
                Run
              </Button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            theme={theme}
            value={getCurrentFileContent()}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              renderWhitespace: "selection",
              selectOnLineNumbers: true,
              matchBrackets: "always",
              autoIndent: "full",
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>

        {/* Bottom Panel */}
        <div className="border-t border-border bg-card">
          <Tabs defaultValue="output" className="w-full">
            <TabsList className="border-b border-border bg-transparent rounded-none h-auto p-0">
              <TabsTrigger
                value="output"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Terminal className="h-4 w-4 mr-1" />
                Output
              </TabsTrigger>
              <TabsTrigger
                value="terminal"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Terminal className="h-4 w-4 mr-1" />
                Terminal
              </TabsTrigger>
              <TabsTrigger
                value="git"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <GitBranch className="h-4 w-4 mr-1" />
                Git
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="output" className="p-4 h-32 overflow-y-auto">
              <div className="text-sm text-muted-foreground font-mono">
                <div className="text-green-600">✓ Code editor ready</div>
                <div className="text-blue-600">→ Select a file to start editing</div>
                <div className="text-gray-600">→ Use Ctrl+S to save, Ctrl+F to find</div>
              </div>
            </TabsContent>
            
            <TabsContent value="terminal" className="p-4 h-32 overflow-y-auto">
              <div className="text-sm text-muted-foreground font-mono">
                <div className="text-green-600">$ Terminal ready</div>
                <div className="text-gray-600">→ Integrated terminal for running commands</div>
              </div>
            </TabsContent>
            
            <TabsContent value="git" className="p-4 h-32 overflow-y-auto">
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <GitBranch className="h-4 w-4 text-green-600" />
                  <span>main branch</span>
                </div>
                <div className="text-gray-600">→ Git integration for version control</div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}