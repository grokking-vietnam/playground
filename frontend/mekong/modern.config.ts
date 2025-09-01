import { appTools, defineConfig } from '@modern-js/app-tools';
import { statePlugin } from '@modern-js/plugin-state';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
    state: true,
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
      bundler: 'rspack', // Using Rspack for better performance
    }),
    statePlugin(),
  ],
  server: {
    port: 3000,
  },
  // Environment variables for microfrontend URLs
  define: {
    'process.env.SHELL_URL': JSON.stringify(process.env.SHELL_URL || 'http://localhost:3001'),
    'process.env.USER_MANAGEMENT_URL': JSON.stringify(process.env.USER_MANAGEMENT_URL || 'http://localhost:3002'),
    'process.env.PERMISSION_CONTROL_URL': JSON.stringify(process.env.PERMISSION_CONTROL_URL || 'http://localhost:3003'),
    'process.env.WORKFLOW_MANAGEMENT_URL': JSON.stringify(process.env.WORKFLOW_MANAGEMENT_URL || 'http://localhost:3004'),
    'process.env.BIGQUERY_URL': JSON.stringify(process.env.BIGQUERY_URL || 'http://localhost:3005'),
  },
});
