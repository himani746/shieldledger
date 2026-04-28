/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/register',
        destination: `${BACKEND_URL}/api/auth/register`,
      },
      {
        source: '/api/auth/login',
        destination: `${BACKEND_URL}/api/auth/login`,
      },
      {
        source: '/api/auth/password',
        destination: `${BACKEND_URL}/api/auth/password`,
      },
      {
        source: '/api/prototype/:path*',
        destination: `${BACKEND_URL}/api/prototype/:path*`,
      },
      {
        source: '/api/documents/:path*',
        destination: `${BACKEND_URL}/api/documents/:path*`,
      },
      {
        source: '/api/documents',
        destination: `${BACKEND_URL}/api/documents`,
      },
      {
        source: '/api/verify',
        destination: `${BACKEND_URL}/api/verify`,
      },
      {
        source: '/api/org',
        destination: `${BACKEND_URL}/api/org`,
      },
    ]
  },
}

export default nextConfig
