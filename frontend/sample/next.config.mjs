/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./apps/**/*'],
    },
  },
  env: {
    MICROFRONTEND_NAME: process.env.MICROFRONTEND || 'shell',
    SHELL_URL: process.env.SHELL_URL || 'http://localhost:3000',
    USER_MANAGEMENT_URL: process.env.USER_MANAGEMENT_URL || 'http://localhost:3001',
    PERMISSION_CONTROL_URL: process.env.PERMISSION_CONTROL_URL || 'http://localhost:3002',
    WORKFLOW_MANAGEMENT_URL: process.env.WORKFLOW_MANAGEMENT_URL || 'http://localhost:3003',
    BIGQUERY_URL: process.env.BIGQUERY_URL || 'http://localhost:3004',
  },
  async rewrites() {
    const microfrontend = process.env.MICROFRONTEND
    
    if (microfrontend && microfrontend !== 'shell') {
      return [
        {
          source: '/:path*',
          destination: `/${microfrontend}/:path*`,
        },
      ]
    }
    
    return []
  },
}

export default nextConfig
