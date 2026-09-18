# AGENTS.md

Guidance for coding agents working in this repository. Nothing here is tied to a
particular tool. Claude Code reads it through `CLAUDE.md`, other agents read
this file directly.

Subdirectories carry their own `AGENTS.md`. Read the one covering the files you
are touching:

| Directory | Covers |
|---|---|
| `src/AGENTS.md` | Component architecture, where new code goes |
| `helm/AGENTS.md` | Chart layout, values layering, deploy knobs |
| `.github/workflows/AGENTS.md` | Workflow call graph, secrets, port allocation |
| `docs/AGENTS.md` | Index of the long-form setup guides |

## Project Overview

Next.js 16 frontend template with TypeScript, Tailwind CSS 4, and CI/CD
infrastructure. Deploys to Kubernetes, with automated feature branch previews via
Cloudflare Tunnel.

## Runtime

Bun is both the package manager and the JavaScript runtime. There is no Node.js
in the production image.

- The `dev`, `build`, and `start` scripts are prefixed with `bun --bun` so the
  Next.js CLI executes on Bun rather than Node. Dropping that flag silently
  falls back to Node, which is why the prefix must stay on any new script that
  invokes `next`.
- The Docker build uses `dhi.io/bun:1.4-debian-dev` for builds and
  `dhi.io/bun:1.4-debian` for the non-root runtime, which starts the standalone
  build with `bun server.js`.
- DHI runtime images run as UID 65532 and do not include a shell or package
  manager. The Dockerfile therefore uses the DHI `-dev` variant for build steps
  and numeric ownership for copied artifacts.
- Runtime tuning uses `BUN_OPTIONS=--smol` (set by the Helm chart via
  `bunOptions.smol`). V8 flags such as `NODE_OPTIONS=--max-old-space-size` do
  nothing on Bun, since it runs JavaScriptCore.
- `packageManager` in `package.json` is the single source of truth for the
  local Bun version. CI parses it, passes it as the `BUN_VERSION` Docker build
  arg, and derives the compatible `DHI_BUN_TAG` series tag, because DHI does
  not publish every upstream patch version.
- Bun 1.4.0 is a hard floor, not a preference (the repo currently pins 1.4.2).
  Bun 1.3.14 segfaults during `next build` (exit 139, then `SIGILL`) because of
  a napi threadsafe-function use-after-free in the next-swc/Turbopack bindings.
  See [oven-sh/bun#36866](https://github.com/oven-sh/bun/issues/36866), fixed
  after 1.3.14 was cut. The crash only reproduces on a real app, so a downgrade
  will look fine locally and fail in CI.

## Essential Commands

```bash
bun install             # Install dependencies (also sets up Husky)
bun run dev             # Dev server with Turbopack at http://localhost:3000
bun run build           # Production bundle
bun start               # Serve the production build

bun run test            # Run tests once with bun test
bun run test:watch      # Watch mode
bun run test:coverage   # Coverage report

bun run lint            # Check with Biome
bun run format          # Format with Biome
bun run type-check      # TypeScript type checking
bun run knip            # Find unused dependencies
```

## Git Hooks (via Husky)

- **Pre-commit**: runs `bun run lint`. Lint failures block the commit.
- **Commit-msg**: enforces [Conventional Commits](https://www.conventionalcommits.org/).
  Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
  `build`, `ci`, `chore`, `revert`. Example: `feat: add user authentication`.

## Architecture

Components follow Atomic Design under `src/components/` (`atoms/`, `molecules/`,
`providers/`, `ui/`). See `src/AGENTS.md` before adding components or routes.

### Environment Variables

- Validated at runtime with Zod schemas in `src/lib/env.ts`.
- Client variables are prefixed `NEXT_PUBLIC_` and are exposed to the browser.
  Server variables have no prefix and stay server-side.
- Read them via `import { env } from '@/lib/env'`. Reaching for `process.env`
  directly bypasses validation and typing.

### Path Aliases

`@/` resolves to `src/` (set in `tsconfig.json`, read natively by `bun test`).

## Code Quality Configuration

### Biome (linting & formatting)

Line width 100, 2-space indent. JavaScript uses single quotes, JSX double
quotes, trailing commas, and semicolons. Strict rules are on for accessibility,
React hooks and exhaustive dependencies, performance (no accumulating spread, no
`delete`), security (no `dangerouslySetInnerHTML`), and unused
imports/variables. Next.js and React domain rules are enabled.

### TypeScript

Strict mode. Path alias `@/*` → `src/*`.

### Testing (bun test)

- Runner is native `bun test`, not Vitest.
- happy-dom via `@happy-dom/global-registrator`, preloaded in `happydom.ts`.
- React Testing Library plus jest-dom matchers, augmented onto `bun:test` in
  `bun-test.d.ts`.
- `test-setup.ts` handles the jest-dom import, ResizeObserver/matchMedia mocks,
  and `afterEach(cleanup)`.
- `bunfig.toml` sets the preload files and a 60% coverage threshold (text +
  lcov reporters).
- Module mocks use `vi.mock` (bun's Vitest-compatible alias). **Bun does not
  hoist mocks**, so a mocked module must be dynamically imported *after* the
  `vi.mock` call, or the real module gets bound first.

## Docker

Multi-stage build tuned for Next.js standalone output. Images are pushed to
GitHub Container Registry (ghcr.io) with multi-platform support (linux/amd64,
linux/arm64). Docker Compose is available for local containerized development.

## Security

Security headers live in `next.config.ts`:

- `X-Frame-Options: DENY` prevents clickjacking.
- `X-Content-Type-Options: nosniff` prevents MIME sniffing.
- `Referrer-Policy: origin-when-cross-origin`.
- `Permissions-Policy` blocks camera, microphone, and geolocation.
- Content Security Policy is currently permissive, allowing `unsafe-inline` and
  `unsafe-eval`. **Tighten before production.** Images are HTTPS-only
  (`img-src 'self' data: https:`).

Next.js `output` is `standalone`, which is what the Docker runtime stage
expects.

## Writing

Applies to docs, comments, commit messages, and PR descriptions. Write the way a
colleague explains something at their desk. Plain and direct, no formal register.

### Punctuation

Use the comma, the full stop, and the paragraph break. These cover nearly every
sentence.

Where a dash feels natural, one of these is usually better.

- Split the sentence in two.
- Use a comma for an aside.
- Use brackets when the aside is genuinely secondary.

Keep the colon for the job it does well, introducing a list or a code block.
Write "the build runs on Bun, so V8 flags do nothing" rather than joining the
two halves with a colon or a semicolon. Two related statements make two
sentences.

Ordinary prose rarely needs a semicolon at all.

### Sentences

Short sentences, concrete words. Say "CI reads the version from
`package.json`", not "the version is obtained from `package.json` by the CI
pipeline". Active voice, and name the thing doing the acting.

Cut words that carry nothing. "In order to" is "to". "Utilise" is "use". If a
sentence still reads correctly with a phrase deleted, delete it.

State the point first, then the detail. A reader who stops after one sentence
should still have the answer.

### Comments

Aim for code that explains itself. A clear name removes the need for a comment,
so spend the effort there first.

Write a comment when the code cannot carry the information on its own.

- Why a non-obvious approach was chosen, especially where the simple one fails.
- A constraint from outside the file, such as an upstream bug or an API quirk.
- A warning about a change that looks safe but breaks something.

`src/proxy.ts` is the model. It explains why dev-server paths are excluded and
what breaks otherwise, which no amount of renaming would convey.

Skip the comment when it restates the line below it. `// Import env to validate
environment variables` above an `import` line tells the reader what they already
see.

Keep comments to a line or two. Longer ones tend to drift from the code as it
changes.

## Important Notes

- Run `bun install` after cloning so Husky hooks are installed.
- Copy `.env.example` to `.env.local` before running locally.
- Feature deployments require the Cloudflare and Kubernetes secrets listed in
  `.github/workflows/AGENTS.md`.
- The feature-branch NodePort range (31000 to 32000) is finite. Delete stale
  branches so their ports are reclaimed.
