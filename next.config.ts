import type { NextConfig } from 'next';

// Bundle analyzer plugin
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Optimize package imports for faster builds and smaller bundles
    optimizePackageImports: ['lucide-react'],
  },
  // Security headers (including CSP with per-request nonces) are set in
  // `src/proxy.ts`. Proxy middleware enables runtime env resolution (e.g.
  // API_URL from Kubernetes) and per-request nonces to eliminate
  // `unsafe-inline` / `unsafe-eval` in the CSP.
};

export default withBundleAnalyzer(nextConfig);
