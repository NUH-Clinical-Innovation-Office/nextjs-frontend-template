import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // biome-ignore lint/suspicious/useAwait: due to nextjs config
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // CSP - Permissive for template use. Tighten based on your needs.
          // Remove 'unsafe-inline' and 'unsafe-eval' in production if possible.
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https:; " +
              "font-src 'self' data:; " +
              "connect-src 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
