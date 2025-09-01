import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Database, 
  Table, 
  Eye, 
  Search,
  Folder,
  FolderOpen
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import { Dataset, Table as TableType, Project } from '../../types';

// Mock data
const mockProjects: Project[] = [
  {
    id: 'demo-project',
    name: 'Demo Project',
    datasets: [
      {
        id: 'ecommerce',
        name: 'ecommerce',
        description: 'E-commerce analytics data',
        location: 'US',
        createdAt: '2024-01-15',
        lastModified: '2024-01-20',
        tables: [
          {
            id: 'users',
            name: 'users',
            description: 'User account information',
            schema: [
              { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
              { name: 'name', type: 'STRING', mode: 'REQUIRED' },
              { name: 'email', type: 'STRING', mode: 'REQUIRED' },
              { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
            ],
            rows: 15432,
            size: 2048000,
            lastModified: '2024-01-20',
            type: 'TABLE'
          },
          {
            id: 'orders',
            name: 'orders',
            description: 'Customer orders',
            schema: [
              { name: 'order_id', type: 'STRING', mode: 'REQUIRED' },
              { name: 'user_id', type: 'INTEGER', mode: 'REQUIRED' },
              { name: 'total', type: 'NUMERIC', mode: 'REQUIRED' },
              { name: 'status', type: 'STRING', mode: 'REQUIRED' },
            ],
            rows: 45231,
            size: 5120000,
            lastModified: '2024-01-19',
            type: 'TABLE'
          }
        ]
      },
      {
        id: 'analytics',
        name: 'analytics',
        description: 'Web analytics data',
        location: 'US',
        createdAt: '2024-01-10',
        lastModified: '2024-01-21',
        tables: [
          {
            id: 'page_views',
            name: 'page_views',
            description: 'Website page view events',
            schema: [
              { name: 'session_id', type: 'STRING', mode: 'REQUIRED' },
              { name: 'page_url', type: 'STRING', mode: 'REQUIRED' },
              { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
              { name: 'user_agent', type: 'STRING', mode: 'NULLABLE' },
            ],
            rows: 1234567,
            size: 102400000,
            lastModified: '2024-01-21',
            type: 'TABLE'
          }
        ]
      }
    ]
  }
];

const DataExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set(['demo-project']));
  const [expandedDatasets, setExpandedDatasets] = useState<Set<string>>(new Set(['ecommerce']));
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const toggleDataset = (datasetId: string) => {
    const newExpanded = new Set(expandedDatasets);
    if (newExpanded.has(datasetId)) {
      newExpanded.delete(datasetId);
    } else {
      newExpanded.add(datasetId);
    }
    setExpandedDatasets(newExpanded);
  };

  const handleTableSelect = (table: TableType) => {
    setSelectedTable(table);
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Data Explorer</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search datasets and tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="space-y-2">
          {mockProjects.map((project) => (
            <div key={project.id} className="space-y-1">
              {/* Project */}
              <button
                onClick={() => toggleProject(project.id)}
                className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md text-left"
              >
                {expandedProjects.has(project.id) ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                {expandedProjects.has(project.id) ? (
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                ) : (
                  <Folder className="h-4 w-4 text-blue-600" />
                )}
                <span className="font-medium text-gray-900">{project.name}</span>
              </button>

              {/* Datasets */}
              {expandedProjects.has(project.id) && (
                <div className="ml-6 space-y-1">
                  {project.datasets.map((dataset) => (
                    <div key={dataset.id} className="space-y-1">
                      <button
                        onClick={() => toggleDataset(dataset.id)}
                        className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md text-left"
                      >
                        {expandedDatasets.has(dataset.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                        <Database className="h-4 w-4 text-green-600" />
                        <span className="text-gray-900">{dataset.name}</span>
                        <span className="text-xs text-gray-500 ml-auto">
                          {dataset.tables.length} tables
                        </span>
                      </button>

                      {/* Tables */}
                      {expandedDatasets.has(dataset.id) && (
                        <div className="ml-6 space-y-1">
                          {dataset.tables.map((table) => (
                            <button
                              key={table.id}
                              onClick={() => handleTableSelect(table)}
                              className={cn(
                                "w-full flex items-center gap-2 p-2 rounded-md text-left hover:bg-gray-100",
                                selectedTable?.id === table.id && "bg-blue-50 border border-blue-200"
                              )}
                            >
                              <Table className="h-4 w-4 text-purple-600" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-gray-900">{table.name}</div>
                                <div className="text-xs text-gray-500 truncate">
                                  {formatNumber(table.rows)} rows • {formatBytes(table.size)}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle preview
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Table Info */}
      {selectedTable && (
        <div className="flex-shrink-0 border-t bg-white p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{selectedTable.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Rows:</span>
                <span>{formatNumber(selectedTable.rows)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Size:</span>
                <span>{formatBytes(selectedTable.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <span>{selectedTable.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Modified:</span>
                <span>{new Date(selectedTable.lastModified).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DataExplorer;
