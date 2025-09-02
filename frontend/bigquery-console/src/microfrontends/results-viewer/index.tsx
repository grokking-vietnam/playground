import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import { QueryResult, QueryJob } from '../../types';

// Mock data
const mockQueryJob: QueryJob = {
  id: 'job-12345',
  query: 'SELECT * FROM `project.dataset.users` LIMIT 100',
  status: 'DONE',
  createdAt: '2024-01-21T10:30:00Z',
  startedAt: '2024-01-21T10:30:02Z',
  completedAt: '2024-01-21T10:30:05Z',
  duration: 3000,
  bytesProcessed: 1024000,
  bytesScanned: 2048000,
  rowsReturned: 100,
};

const mockResults: QueryResult = {
  jobId: 'job-12345',
  schema: [
    { name: 'id', type: 'INTEGER', mode: 'REQUIRED' },
    { name: 'name', type: 'STRING', mode: 'REQUIRED' },
    { name: 'email', type: 'STRING', mode: 'REQUIRED' },
    { name: 'age', type: 'INTEGER', mode: 'NULLABLE' },
    { name: 'city', type: 'STRING', mode: 'NULLABLE' },
    { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
  ],
  rows: Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    age: 20 + (i % 50),
    city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
    created_at: new Date(2024, 0, 1 + (i % 30)).toISOString(),
  })),
  totalRows: 100,
};

const columnHelper = createColumnHelper<any>();

const ResultsViewer: React.FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Create table columns based on schema
  const columns = useMemo(() => {
    if (!mockResults.schema) return [];
    
    return mockResults.schema.map((field) =>
      columnHelper.accessor(field.name, {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            {field.name}
            <div className="ml-2">
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-3 w-3" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-3 w-3" />
              ) : (
                <ArrowUpDown className="h-3 w-3" />
              )}
            </div>
          </Button>
        ),
        cell: ({ getValue }) => {
          const value = getValue();
          if (field.type === 'TIMESTAMP') {
            return new Date(value).toLocaleString();
          }
          if (field.type === 'INTEGER' || field.type === 'NUMERIC') {
            return typeof value === 'number' ? value.toLocaleString() : value;
          }
          return value?.toString() || '';
        },
        meta: {
          type: field.type,
          mode: field.mode,
        },
      })
    );
  }, [mockResults.schema]);

  const table = useReactTable({
    data: mockResults.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  const getStatusIcon = (status: QueryJob['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'RUNNING':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'DONE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const exportResults = (format: 'csv' | 'json') => {
    const data = table.getFilteredRowModel().rows.map(row => row.original);
    
    if (format === 'csv') {
      const headers = columns.map(col => col.id).join(',');
      const csvData = data.map(row => 
        columns.map(col => row[col.id as string]).join(',')
      ).join('\n');
      
      const blob = new Blob([headers + '\n' + csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'query_results.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'query_results.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Query Status */}
      <div className="border-b bg-white">
        {/* Collapsible Header */}
        <div 
          className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b cursor-pointer hover:bg-gray-100"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <h3 className="text-lg font-medium text-gray-900">Query Results</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Content when expanded */}
        {!isCollapsed && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportResults('csv')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportResults('json')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  JSON
                </Button>
              </div>
            </div>

            {/* Job Status Card */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(mockQueryJob.status)}
                    <span className="font-medium">{mockQueryJob.status}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Job ID: {mockQueryJob.id}
                  </div>
                  <div className="text-sm text-gray-600">
                    Duration: {mockQueryJob.duration ? formatDuration(mockQueryJob.duration) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Processed: {mockQueryJob.bytesProcessed ? formatBytes(mockQueryJob.bytesProcessed) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">
                    Rows: {mockQueryJob.rowsReturned?.toLocaleString() || 0}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search results..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      {!isCollapsed && (
        <>
          <div className="flex-1 overflow-auto">
            <div className="bg-white border-b">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 last:border-r-0"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="border-t bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{' '}
                  of {table.getFilteredRowModel().rows.length} results
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm text-gray-600">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsViewer;
