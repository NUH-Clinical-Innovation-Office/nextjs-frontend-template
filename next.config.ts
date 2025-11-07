import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // biome-ignore lint/suspicious/useAwait: due to nextjs config
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevents clickjacking attacks by disallowing the site to be embedded in iframes
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
          // preload: allows inclusion in browser HSTS preload lists for first-visit protection
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
          // Current configuration is permissive for template use. Tighten for production:
          // - Remove 'unsafe-inline' by using nonces or hashes for inline scripts/styles
          // - Remove 'unsafe-eval' by avoiding eval(), new Function(), and similar dynamic code execution
          // - Restrict img-src to specific domains instead of allowing all HTTPS sources
          // - Add object-src 'none' to block plugins, frame-ancestors 'none' for additional clickjacking protection
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

export default nextConfig;
