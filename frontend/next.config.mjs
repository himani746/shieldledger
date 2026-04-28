/** @type {import('next').NextConfig} */
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
        destination: 'http://localhost:4000/api/auth/register',
      },
      {
        source: '/api/auth/login',
        destination: 'http://localhost:4000/api/auth/login',
      },
      {
        source: '/api/auth/password',
        destination: 'http://localhost:4000/api/auth/password',
      },
      {
        source: '/api/prototype/:path*',
        destination: 'http://localhost:4000/api/prototype/:path*',
      },
      {
        source: '/api/documents/:path*',
        destination: 'http://localhost:4000/api/documents/:path*',
      },
      {
        source: '/api/documents',
        destination: 'http://localhost:4000/api/documents',
      },
      {
        source: '/api/verify',
        destination: 'http://localhost:4000/api/verify',
      },
      {
        source: '/api/org',
        destination: 'http://localhost:4000/api/org',
      },
    ]
  },
}

export default nextConfig
