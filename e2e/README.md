# Browser tests

Run `bun run e2e:install` once after installing dependencies, then `bun run e2e`.
Playwright builds the app and serves `.next/standalone/start.mjs` with Bun on
port 3100, including its public and static assets. It runs every test on desktop
Chromium and a Pixel 7 viewport. The same suite gates Docker builds in CI.

Tests use `*.e2e.ts` so Bun's unit test runner leaves them to Playwright. Import
`test` and `expect` from `./fixtures` to fail on browser console errors and
uncaught exceptions. Use accessible roles and names for controls.

Run `BASE_URL=https://your-preview.example.com bun run e2e:smoke` to test a
deployed preview. This skips the local build and runs only read-only smoke tests.
The full suite additionally covers keyboard theme toggling, saved theme choice,
forms, tabs, dialog interactions, repeated slider input, progress semantics, and
calendar hydration across locales and timezones. Traces and screenshots are saved under
`test-results/` on failure. CI also uploads its HTML report.
