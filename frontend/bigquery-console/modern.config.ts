import { appTools, defineConfig } from '@modern-js/app-tools';
import { statePlugin } from '@modern-js/plugin-state';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  runtime: {
    router: true,
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
});
