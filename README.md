This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Initial Setup for New Users

After cloning this repository, run:

```bash
npm install
```

This will automatically set up Husky git hooks via the `prepare` script.

### Husky Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality through git hooks:

#### Pre-commit Hook

- Runs `npm run lint` before each commit
- Ensures code passes linting checks before allowing commits

#### Commit Message Hook

- Validates commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) format
- Enforced via [commitlint](https://commitlint.js.org/)
- Valid commit types:
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes (formatting, etc.)
  - `refactor`: Code refactoring
  - `perf`: Performance improvements
  - `test`: Adding or updating tests
  - `build`: Build system or dependency changes
  - `ci`: CI/CD changes
  - `chore`: Other changes
  - `revert`: Revert a previous commit

**Example valid commit messages:**

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve navigation bug"
git commit -m "docs: update readme with setup instructions"
```

**Testing if Husky is working:**

```bash
# This should fail (invalid commit message format)
git commit --allow-empty -m "invalid message"

# This should pass (valid format)
git commit --allow-empty -m "test: verify husky setup"
```

## Security

### Security Headers

This template includes security headers configured in `next.config.ts` to protect against common web vulnerabilities:

**X-Frame-Options: DENY**

- Prevents your site from being embedded in iframes
- Protects against clickjacking attacks where attackers overlay invisible frames

**X-Content-Type-Options: nosniff**

- Prevents browsers from MIME-sniffing (guessing content types)
- Forces browsers to respect the declared Content-Type, preventing script execution vulnerabilities

**Referrer-Policy: origin-when-cross-origin**

- Controls what referrer information is sent with requests
- Sends full URL for same-origin requests, only origin for cross-origin requests

**X-DNS-Prefetch-Control: on**

- Enables DNS prefetching for external resources
- Improves performance by resolving domain names before users click links

**Permissions-Policy: camera=(), microphone=(), geolocation=()**

- Blocks access to sensitive browser APIs (camera, microphone, location)
- Prevents malicious scripts from accessing these features

**Content-Security-Policy (CSP)**

- Controls which resources can be loaded and executed
- `default-src 'self'`: Only load resources from your domain
- `script-src 'self' 'unsafe-eval' 'unsafe-inline'`: Allows inline scripts (permissive for template)
- `style-src 'self' 'unsafe-inline'`: Allows inline styles
- `img-src 'self' data: https:`: Images from your domain, data URIs, or any HTTPS source
- `font-src 'self' data:`: Fonts from your domain or data URIs
- `connect-src 'self'`: API calls only to your domain

**Note:** The CSP is intentionally permissive for a template. For production, tighten it by removing `'unsafe-inline'` and `'unsafe-eval'` based on your specific requirements.

### Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
