import type { NextConfig } from 'next';

// Bundle analyzer plugin
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Optimize package imports for faster builds and smaller bundles
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dropdown-menu'],
  },
  // biome-ignore lint/suspicious/useAwait: due to nextjs config
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevents click-jacking attacks by disallowing the site to be embedded in iframes
          // Protects against attackers overlaying invisible frames to capture user interactions
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevents browsers from MIME-sniffing content types
          // Forces browsers to respect the declared Content-Type, preventing script execution vulnerabilities
          // when user-uploaded files are misinterpreted as executable code
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Controls referrer information sent with requests
          // Sends full URL for same-origin requests, only origin for cross-origin requests
          // Balances privacy with functionality for analytics and CSRF protection
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Enables DNS prefetching for external resources to improve performance
          // Resolves domain names before users click links, reducing latency
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Enforces HTTPS-only transport for all future requests (1 year duration)
          // Critical for preventing protocol downgrade attacks and ensuring secure connections
          // includeSubDomains: applies to all subdomains
          // preload: allows inclusion in browser HTTP Strict Transport Security preload lists for first-visit protection
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Blocks access to sensitive browser APIs (camera, microphone, geolocation, etc.)
          // Prevents malicious scripts from accessing these features without explicit permission
          // Add more features as needed: payment=(), usb=(), magnetometer=(), gyroscope=()
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Prevents Adobe Flash/PDF from loading cross-domain content
          // While Flash is deprecated, this header still provides defense-in-depth for PDF viewers
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
          // Content Security Policy - Controls which resources can be loaded and executed
          // CRITICAL: Current configuration allows 'unsafe-inline' and 'unsafe-eval' which significantly
          // weakens XSS protection. This is permissive for template use and MUST be hardened for production.
          //
          // For production use, implement nonce-based CSP:
          // 1. Generate unique nonce per request in middleware
          // 2. Pass nonce to script/style tags via headers
          // 3. Update CSP: script-src 'self' 'nonce-{NONCE}' (remove unsafe-*)
          //
          // Reference: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https:; " +
              "font-src 'self' data:; " +
              "connect-src 'self'; " +
              "object-src 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self'; " +
              "frame-ancestors 'none'; " +
              'upgrade-insecure-requests;',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
