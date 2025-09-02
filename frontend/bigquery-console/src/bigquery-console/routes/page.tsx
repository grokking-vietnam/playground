import { Helmet } from '@modern-js/runtime/head';
import { useState } from 'react';
import { Database, Play, Download, Settings, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import QueryEditor from '../../microfrontends/query-editor';
import DataExplorer from '../../microfrontends/data-explorer';
import ResultsViewer from '../../microfrontends/results-viewer';

const BigQueryConsole = () => {
  const [activeTab, setActiveTab] = useState<'query' | 'explorer' | 'results'>('query');
  const [currentQuery, setCurrentQuery] = useState(`-- Welcome to BigQuery Console
-- Write your SQL queries here

SELECT 
  name,
  age,
  city
FROM \`project.dataset.users\`
WHERE age > 21
ORDER BY name
LIMIT 100;`);

  return (
    <div className="h-screen flex flex-col bg-white">
      <Helmet>
        <title>BigQuery Console - Modern.js</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </Helmet>
      
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">BigQuery Console</h1>
            <p className="text-sm text-gray-500">Modern.js Microfrontend</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            Run Query
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b bg-gray-50 px-6">
        <div className="flex space-x-8">
          {[
            { id: 'query', label: 'Query Editor', icon: BarChart3 },
            { id: 'explorer', label: 'Data Explorer', icon: Database },
            { id: 'results', label: 'Query Results', icon: Download },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'query' && (
          <div className="flex-1 flex flex-col">
            {/* Query Editor */}
            <div className="flex-1 border-b">
              <QueryEditor 
                value={currentQuery}
                onChange={setCurrentQuery}
              />
            </div>
            
            {/* Results Preview */}
            <div className="flex-1">
              <ResultsViewer />
            </div>
          </div>
        )}
        
        {activeTab === 'explorer' && (
          <div className="flex-1 flex">
            {/* Data Explorer Sidebar */}
            <div className="w-1/3 border-r">
              <DataExplorer />
            </div>
            
            {/* Table Schema/Preview */}
            <div className="flex-1 p-6">
              <Card>
                <CardHeader>
                  <CardTitle>Table Schema</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">Select a table from the explorer to view its schema</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {activeTab === 'results' && (
          <div className="flex-1">
            <ResultsViewer />
          </div>
        )}
      </main>

      {/* Status Bar */}
      <footer className="border-t bg-gray-50 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>Ready</span>
            <span>•</span>
            <span>Project: demo-project</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Query cost: $0.00</span>
            <span>•</span>
            <span>Last run: Never</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BigQueryConsole;
