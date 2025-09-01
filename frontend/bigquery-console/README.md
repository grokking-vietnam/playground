# BigQuery Console - Modern.js Microfrontend

A modern BigQuery console UI built with Modern.js, Rspack, and React. This application demonstrates a microfrontend architecture similar to Google BigQuery's web interface.

## 🚀 Features

### Core Functionality
- **SQL Query Editor** with syntax highlighting (Monaco Editor)
- **Data Explorer** with hierarchical dataset/table navigation
- **Results Viewer** with sorting, filtering, and pagination
- **Real-time Query Status** tracking and job management
- **Export Capabilities** (CSV, JSON)
- **Query History** management

### Technical Features
- **Microfrontend Architecture** using Modern.js
- **Rspack Bundler** for fast build times
- **TypeScript** for type safety
- **Tailwind CSS** for modern styling
- **React Query** for data management
- **Monaco Editor** for SQL syntax highlighting
- **Tanstack Table** for advanced data tables

## 🏗️ Architecture

```
src/
├── components/ui/          # Reusable UI components
├── lib/                    # Utility functions
├── types/                  # TypeScript type definitions
├── microfrontends/        # Microfrontend modules
│   ├── query-editor/      # SQL editor with Monaco
│   ├── data-explorer/     # Dataset/table browser
│   └── results-viewer/    # Query results display
└── bigquery-console/      # Main application shell
    └── routes/            # Application routes
```

### Microfrontend Components

1. **Query Editor** (`/src/microfrontends/query-editor/`)
   - Monaco Editor integration
   - SQL syntax highlighting
   - Query formatting and validation
   - Query history management

2. **Data Explorer** (`/src/microfrontends/data-explorer/`)
   - Hierarchical project/dataset/table navigation
   - Search functionality
   - Table metadata display
   - Schema information

3. **Results Viewer** (`/src/microfrontends/results-viewer/`)
   - Advanced data table with sorting/filtering
   - Pagination with customizable page sizes
   - Export functionality (CSV, JSON)
   - Query job status tracking

## 🛠️ Technology Stack

- **Framework**: Modern.js v2.68.11
- **Bundler**: Rspack (Rust-based, faster than Webpack)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor
- **Data Tables**: Tanstack React Table
- **State Management**: React Query
- **Icons**: Lucide React
- **Package Manager**: pnpm

## 🚦 Getting Started

### Prerequisites
- Node.js 16.18.1 or higher
- pnpm package manager

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd frontend/bigquery-console
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start development server**:
   ```bash
   pnpm run dev
   ```

4. **Open browser**:
   Navigate to `http://localhost:3000`

### Available Scripts

```bash
# Development
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run serve        # Preview production build
pnpm run start        # Start production server

# Code Quality
pnpm run lint         # Run Biome linter
pnpm run new          # Add new features/entries

# Maintenance
pnpm run reset        # Clean node_modules
pnpm run upgrade      # Upgrade Modern.js
```

## 🎨 UI/UX Design

The application follows BigQuery's design patterns:

- **Header**: Logo, project selector, and action buttons
- **Navigation Tabs**: Switch between Query Editor, Data Explorer, and Results
- **Split Layout**: Editor and results side-by-side for productivity
- **Status Bar**: Query costs, execution time, and connection status
- **Modern Design**: Clean, professional interface with proper spacing

### Color Scheme
- **Primary**: Blue (#3b82f6) for actions and highlights
- **Secondary**: Gray scale for text and borders
- **Success**: Green for completed operations
- **Warning**: Yellow for pending operations
- **Error**: Red for failed operations

## 🔧 Configuration

### Modern.js Configuration (`modern.config.ts`)
```typescript
export default defineConfig({
  runtime: {
    router: true,
    state: true,
  },
  source: {
    entries: {
      main: './src/routes/page.tsx',
      'query-editor': './src/microfrontends/query-editor/index.tsx',
      'data-explorer': './src/microfrontends/data-explorer/index.tsx',
      'results-viewer': './src/microfrontends/results-viewer/index.tsx',
    },
  },
  tools: {
    postcss: (config, { addPlugins }) => {
      addPlugins([
        require('tailwindcss'),
        require('autoprefixer'),
      ]);
    },
  },
  plugins: [
    appTools({
      bundler: 'rspack', // Using Rspack for performance
    }),
  ],
});
```

### Tailwind Configuration
- Custom color palette matching BigQuery's design
- Extended spacing and typography
- Responsive design utilities
- Typography plugin for better text rendering

## 🧪 Mock Data

The application includes comprehensive mock data:

- **Projects**: Demo project with multiple datasets
- **Datasets**: E-commerce and analytics datasets
- **Tables**: Users, orders, page views with realistic schemas
- **Query Results**: 100 sample rows with various data types
- **Query Jobs**: Simulated job execution with status tracking

## 🚀 Production Deployment

### Build Process
```bash
pnpm run build
```

The build process:
1. **TypeScript Compilation**: Type checking and transpilation
2. **Rspack Bundling**: Fast bundling with tree shaking
3. **CSS Processing**: Tailwind CSS compilation and optimization
4. **Asset Optimization**: Image and font optimization
5. **Code Splitting**: Automatic microfrontend chunking

### Performance Optimizations
- **Rspack**: 5-10x faster than Webpack
- **Code Splitting**: Automatic microfrontend separation
- **Tree Shaking**: Remove unused code
- **CSS Purging**: Remove unused Tailwind classes
- **Monaco Editor**: Lazy loading for better initial load time

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** and test thoroughly
4. **Run linting**: `pnpm run lint`
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## 📄 License

This project is part of the Grokking Playground and follows the repository's licensing terms.

## 🎯 Future Enhancements

- [ ] Real backend integration
- [ ] Advanced query optimization suggestions
- [ ] Query visualization and execution plans
- [ ] Collaborative query editing
- [ ] Advanced export formats (Parquet, Avro)
- [ ] Query scheduling and automation
- [ ] Advanced data visualization charts
- [ ] Query performance analytics
- [ ] Multi-project support
- [ ] Advanced security and permissions

## 📞 Support

For questions or issues, please refer to the main repository documentation or create an issue in the project repository.

---

Built with ❤️ using Modern.js and Rspack