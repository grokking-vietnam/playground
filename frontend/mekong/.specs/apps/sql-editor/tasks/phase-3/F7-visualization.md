# F7. Data Visualization

## Task Information
- **Task ID**: F7-data-visualization
- **Feature**: F7. Data Visualization
- **Priority**: P1
- **Effort**: Medium (3-5 days)
- **AI Complexity**: Low
- **Phase**: 3

## Dependencies
- [ ] F5. Results Display and Export completed
- [ ] Query results data available
- [ ] Recharts library available in dependencies

## Description
Add interactive data visualization capabilities to transform query results into charts, graphs, and dashboards. This includes an intelligent chart builder, multiple chart types, and the ability to create and share visualizations.

## Acceptance Criteria
- [ ] Charts render within 5 seconds for datasets up to 10K data points
- [ ] Chart builder suggests appropriate chart types based on data characteristics
- [ ] Charts are interactive with zoom, pan, and hover details functionality
- [ ] Charts can be exported as PNG/SVG images with proper resolution
- [ ] Multiple chart types supported (bar, line, pie, scatter, area, histogram)
- [ ] Charts update automatically when underlying query results change
- [ ] Dashboard functionality allows combining multiple visualizations
- [ ] Chart configurations can be saved and shared with other users
- [ ] Responsive design works on different screen sizes

## Implementation Steps

### 1. Setup and Planning
- [ ] Review existing visualization tab in page.tsx (lines 1180-1184)
- [ ] Research Recharts library capabilities and patterns
- [ ] Design chart configuration and data transformation architecture
- [ ] Plan chart type recommendation system

### 2. Chart Builder Interface
- [ ] Create interactive chart configuration UI
- [ ] Implement data column mapping for axes and grouping
- [ ] Add chart type selector with previews
- [ ] Create real-time chart preview during configuration

### 3. Chart Rendering Engine
- [ ] Implement chart renderers for different types using Recharts
- [ ] Add data transformation service for chart compatibility
- [ ] Create responsive chart sizing and layout
- [ ] Add interactive features (tooltips, zoom, pan)

### 4. Chart Management
- [ ] Implement chart saving and loading functionality
- [ ] Add chart export capabilities (PNG, SVG, PDF)
- [ ] Create chart sharing and embedding features
- [ ] Add chart templates and presets

### 5. Dashboard Features
- [ ] Create dashboard layout with multiple charts
- [ ] Implement dashboard sharing and collaboration
- [ ] Add dashboard export and presentation modes
- [ ] Create dashboard templates

## Files to Create/Modify

### New Files
```
src/apps/sql-editor/
├── components/visualization/
│   ├── ChartBuilder.tsx
│   ├── ChartRenderer.tsx
│   ├── ChartTypeSelector.tsx
│   ├── ChartConfigPanel.tsx
│   ├── ChartPreview.tsx
│   ├── ChartExport.tsx
│   ├── Dashboard.tsx
│   ├── DashboardGrid.tsx
│   └── ChartTemplates.tsx
├── services/
│   ├── DataTransformationService.ts
│   ├── ChartRecommendationService.ts
│   ├── ChartExportService.ts
│   └── DashboardService.ts
├── types/
│   ├── charts.ts
│   ├── visualization.ts
│   └── dashboard.ts
├── utils/
│   ├── chartUtils.ts
│   ├── dataAnalysis.ts
│   └── colorPalettes.ts
├── hooks/
│   ├── useChartBuilder.ts
│   ├── useChartData.ts
│   ├── useChartExport.ts
│   └── useDashboard.ts
└── __tests__/
    ├── components/
    │   ├── ChartBuilder.test.tsx
    │   └── ChartRenderer.test.tsx
    ├── services/
    │   ├── DataTransformationService.test.ts
    │   └── ChartRecommendationService.test.ts
    └── utils/
        ├── chartUtils.test.ts
        └── dataAnalysis.test.ts
```

### Modified Files
- `src/apps/sql-editor/page.tsx` - Replace empty visualization tab with chart builder
- `src/apps/sql-editor/types/index.ts` - Export visualization types

## Technical Specifications

### TypeScript Interfaces
```typescript
interface ChartConfig {
  id: string
  name: string
  type: ChartType
  title?: string
  description?: string
  xAxis: AxisConfig
  yAxis: AxisConfig[]
  groupBy?: string
  filterBy?: FilterConfig[]
  aggregation?: AggregationConfig
  styling: ChartStyling
  interactive: boolean
  responsive: boolean
}

enum ChartType {
  BAR = 'bar',
  LINE = 'line',
  PIE = 'pie',
  SCATTER = 'scatter',
  AREA = 'area',
  HISTOGRAM = 'histogram',
  HEATMAP = 'heatmap',
  TREEMAP = 'treemap'
}

interface AxisConfig {
  column: string
  label?: string
  type: 'categorical' | 'numerical' | 'temporal'
  scale?: 'linear' | 'log' | 'time'
  format?: string
  domain?: [number, number] | string[]
}

interface AggregationConfig {
  function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median'
  column?: string
}

interface ChartStyling {
  colors: string[]
  theme: 'light' | 'dark'
  fontSize: number
  showLegend: boolean
  showGrid: boolean
  showTooltip: boolean
  width?: number
  height?: number
}

interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
  metadata: ChartMetadata
}

interface ChartDataset {
  label: string
  data: (number | { x: any, y: any })[]
  backgroundColor?: string | string[]
  borderColor?: string
  borderWidth?: number
  fill?: boolean
}

interface ChartMetadata {
  totalDataPoints: number
  dataTypes: Record<string, string>
  suggestedChartTypes: ChartType[]
  warnings?: string[]
}

interface Dashboard {
  id: string
  name: string
  description?: string
  layout: DashboardLayout
  charts: DashboardChart[]
  filters: DashboardFilter[]
  createdBy: string
  createdAt: Date
  isPublic: boolean
}

interface DashboardChart {
  id: string
  chartConfig: ChartConfig
  queryId?: string
  position: ChartPosition
  size: ChartSize
}

interface ChartPosition {
  x: number
  y: number
  w: number
  h: number
}

interface ChartRecommendation {
  chartType: ChartType
  confidence: number
  reasoning: string
  suggestedConfig: Partial<ChartConfig>
}
```

### Service Methods
```typescript
class DataTransformationService {
  transformForChart(results: QueryResult, config: ChartConfig): ChartData
  analyzeDataTypes(results: QueryResult): Record<string, string>
  detectOutliers(data: number[]): number[]
  groupData(results: QueryResult, groupByColumn: string): Record<string, any[]>
  aggregateData(data: any[], aggregation: AggregationConfig): any[]
}

class ChartRecommendationService {
  recommendChartTypes(results: QueryResult): ChartRecommendation[]
  analyzeColumnTypes(columns: ColumnDefinition[]): ColumnAnalysis[]
  detectPatterns(data: any[][]): DataPattern[]
  suggestAxisMapping(columns: ColumnDefinition[]): AxisSuggestion[]
}

class ChartExportService {
  exportAsPNG(chartElement: HTMLElement, options?: ExportOptions): Promise<Blob>
  exportAsSVG(chartConfig: ChartConfig, data: ChartData): Promise<string>
  exportAsPDF(charts: ChartConfig[], data: ChartData[]): Promise<Blob>
  exportAsImage(chartId: string, format: 'png' | 'svg' | 'jpeg'): Promise<Blob>
}

class DashboardService {
  createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt'>): Promise<Dashboard>
  updateDashboard(id: string, updates: Partial<Dashboard>): Promise<Dashboard>
  getDashboard(id: string): Promise<Dashboard | null>
  getDashboards(userId?: string): Promise<Dashboard[]>
  shareDashboard(id: string, permissions: SharePermissions): Promise<void>
  exportDashboard(id: string, format: 'pdf' | 'png'): Promise<Blob>
}
```

## Testing Requirements

### Unit Tests
- [ ] Chart data transformation for different chart types
- [ ] Chart recommendation algorithm accuracy
- [ ] Chart export functionality
- [ ] Dashboard layout and management
- [ ] Color palette and styling application
- [ ] Responsive chart resizing

### Integration Tests
- [ ] Chart builder with real query results
- [ ] Chart updates when query results change
- [ ] Dashboard creation and sharing workflow
- [ ] Chart export with different formats

### Accessibility Tests
- [ ] Chart accessibility with screen readers
- [ ] Keyboard navigation for chart interactions
- [ ] ARIA labels for chart elements
- [ ] High contrast mode support
- [ ] Alternative text for exported charts

## Performance Considerations
- [ ] Efficient rendering for large datasets (10K+ points)
- [ ] Chart virtualization for extremely large datasets
- [ ] Debounced chart updates during configuration
- [ ] Lazy loading of chart libraries
- [ ] Optimized export generation for high-resolution images

## Security Considerations
- [ ] Sanitize chart titles and labels to prevent XSS
- [ ] Validate chart configuration to prevent malicious data
- [ ] Secure handling of dashboard sharing permissions
- [ ] Rate limiting for chart export operations

## AI Implementation Guidance

### Recommended Approach
1. Start with basic chart builder UI using existing results data
2. Implement data transformation service for Recharts compatibility
3. Create chart renderers for 2-3 basic chart types (bar, line, pie)
4. Add chart configuration panel with real-time preview
5. Implement chart recommendation based on data analysis
6. Add chart export functionality
7. Create dashboard layout system
8. Add advanced chart types and features

### Code Examples
```typescript
// Chart builder pattern
const useChartBuilder = (results: QueryResult) => {
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [recommendations, setRecommendations] = useState<ChartRecommendation[]>([])
  
  const generateChart = useCallback((config: ChartConfig) => {
    const transformedData = dataTransformationService.transformForChart(results, config)
    setChartData(transformedData)
    setChartConfig(config)
  }, [results])
  
  const updateChartConfig = (updates: Partial<ChartConfig>) => {
    if (!chartConfig) return
    
    const newConfig = { ...chartConfig, ...updates }
    setChartConfig(newConfig)
    generateChart(newConfig)
  }
  
  useEffect(() => {
    if (results) {
      const recs = chartRecommendationService.recommendChartTypes(results)
      setRecommendations(recs)
      
      // Auto-generate chart with best recommendation
      if (recs.length > 0) {
        const bestRec = recs[0]
        const defaultConfig: ChartConfig = {
          id: generateId(),
          name: 'Untitled Chart',
          type: bestRec.chartType,
          ...bestRec.suggestedConfig,
          styling: getDefaultStyling(),
          interactive: true,
          responsive: true
        }
        generateChart(defaultConfig)
      }
    }
  }, [results, generateChart])
  
  return {
    chartConfig,
    chartData,
    recommendations,
    generateChart,
    updateChartConfig
  }
}

// Chart recommendation logic
const recommendChartTypes = (results: QueryResult): ChartRecommendation[] => {
  const recommendations: ChartRecommendation[] = []
  const columnTypes = analyzeColumnTypes(results.columns)
  
  const numericalColumns = columnTypes.filter(c => c.type === 'numerical')
  const categoricalColumns = columnTypes.filter(c => c.type === 'categorical')
  const temporalColumns = columnTypes.filter(c => c.type === 'temporal')
  
  // Bar chart recommendation
  if (categoricalColumns.length >= 1 && numericalColumns.length >= 1) {
    recommendations.push({
      chartType: ChartType.BAR,
      confidence: 0.8,
      reasoning: 'Categorical data with numerical values is ideal for bar charts',
      suggestedConfig: {
        xAxis: { column: categoricalColumns[0].name, type: 'categorical' },
        yAxis: [{ column: numericalColumns[0].name, type: 'numerical' }]
      }
    })
  }
  
  // Line chart recommendation
  if (temporalColumns.length >= 1 && numericalColumns.length >= 1) {
    recommendations.push({
      chartType: ChartType.LINE,
      confidence: 0.9,
      reasoning: 'Time series data is perfect for line charts',
      suggestedConfig: {
        xAxis: { column: temporalColumns[0].name, type: 'temporal' },
        yAxis: [{ column: numericalColumns[0].name, type: 'numerical' }]
      }
    })
  }
  
  // Pie chart recommendation
  if (categoricalColumns.length === 1 && numericalColumns.length === 1) {
    const uniqueValues = getUniqueValueCount(results, categoricalColumns[0].name)
    if (uniqueValues <= 10) {
      recommendations.push({
        chartType: ChartType.PIE,
        confidence: 0.7,
        reasoning: 'Small number of categories suitable for pie chart',
        suggestedConfig: {
          groupBy: categoricalColumns[0].name,
          aggregation: { function: 'sum', column: numericalColumns[0].name }
        }
      })
    }
  }
  
  return recommendations.sort((a, b) => b.confidence - a.confidence)
}

// Chart renderer with Recharts
const ChartRenderer: React.FC<{ config: ChartConfig, data: ChartData }> = ({ 
  config, 
  data 
}) => {
  const renderChart = () => {
    switch (config.type) {
      case ChartType.BAR:
        return (
          <BarChart width={config.styling.width} height={config.styling.height} data={data.datasets[0].data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {config.styling.showLegend && <Legend />}
            <Bar dataKey="value" fill={config.styling.colors[0]} />
          </BarChart>
        )
      
      case ChartType.LINE:
        return (
          <LineChart width={config.styling.width} height={config.styling.height} data={data.datasets[0].data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {config.styling.showLegend && <Legend />}
            <Line type="monotone" dataKey="value" stroke={config.styling.colors[0]} />
          </LineChart>
        )
      
      case ChartType.PIE:
        return (
          <PieChart width={config.styling.width} height={config.styling.height}>
            <Pie
              data={data.datasets[0].data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill={config.styling.colors[0]}
            />
            <Tooltip />
            {config.styling.showLegend && <Legend />}
          </PieChart>
        )
      
      default:
        return <div>Unsupported chart type</div>
    }
  }
  
  return (
    <div className="chart-container">
      {config.title && (
        <h3 className="text-lg font-semibold mb-4">{config.title}</h3>
      )}
      <ResponsiveContainer width="100%" height={config.styling.height || 400}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}
```

### Integration Points
- Connect to query results from F5 task
- Integrate with query execution for real-time updates
- Use user authentication for chart sharing
- Connect to query library for chart templates
- Integrate with export functionality

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Charts render within 5 seconds for 10K data points
- [ ] Chart builder provides intelligent recommendations
- [ ] Interactive features (zoom, pan, hover) work correctly
- [ ] Chart export functionality produces high-quality images
- [ ] Multiple chart types supported and working
- [ ] Charts update automatically with new query results
- [ ] Dashboard functionality allows multiple chart layouts
- [ ] Unit tests achieve >80% coverage
- [ ] Integration tests verify chart generation workflow
- [ ] Performance benchmarks met for large datasets
- [ ] Accessibility requirements verified
- [ ] Documentation updated with visualization features

## Notes
- Consider implementing custom chart types for SQL-specific visualizations
- Plan for advanced analytics features (trend lines, forecasting)
- Design for future real-time data streaming capabilities
- Consider implementing collaborative dashboard editing
- Plan for integration with external BI tools

---

*This task adds powerful data visualization capabilities to transform query results into insights.*
