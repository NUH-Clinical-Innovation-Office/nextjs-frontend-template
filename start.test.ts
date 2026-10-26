/** biome-ignore-all lint/style/useNamingConvention: Environment variable names are uppercase. */
import { afterEach, expect, test } from 'bun:test';
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const directories: string[] = [];

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function start(
  secrets: string | undefined | null,
  server: string,
  existingEnv: Record<string, string> = {},
) {
  const directory = mkdtempSync(join(tmpdir(), 'vault-start-'));
  directories.push(directory);
  copyFileSync(join(import.meta.dir, 'start.mjs'), join(directory, 'start.mjs'));
  writeFileSync(join(directory, 'server.js'), server);
  const secretsFile = join(directory, 'secrets.json');
  if (typeof secrets === 'string') writeFileSync(secretsFile, secrets);
  const result = Bun.spawnSync([process.execPath, 'start.mjs'], {
    cwd: directory,
    env: {
      ...process.env,
      ...existingEnv,
      VAULT_SECRETS_FILE: secrets === null ? '' : secretsFile,
    },
  });
  return { exitCode: result.exitCode, stderr: new TextDecoder().decode(result.stderr) };
}

test('Vault secrets load literally before server modules read the environment', () => {
  const secret = 'quotes " and \' plus $() and a newline\n';
  const loaded = start(
    JSON.stringify({ VAULT_TEST_SECRET: secret }),
    `if (process.env.VAULT_TEST_SECRET !== ${JSON.stringify(secret)}) throw new Error('secret unavailable at startup');`,
  );
  expect(loaded.exitCode).toBe(0);
});

test('startup works without Vault when no file is configured', () => {
  expect(start(null, '').exitCode).toBe(0);
});

test('explicit container environment takes precedence over Vault', () => {
  const result = start(
    JSON.stringify({ API_URL: 'https://vault.example.test' }),
    "if (process.env.API_URL !== 'https://explicit.example.test') throw new Error('wrong precedence');",
    { API_URL: 'https://explicit.example.test' },
  );
  expect(result.exitCode).toBe(0);
});

test('missing or malformed Vault files stop startup without revealing secret contents', () => {
  for (const content of [undefined, '{private-fixture', JSON.stringify({ API_SECRET: 42 })]) {
    const result = start(content, "throw new Error('server must not start');");
    expect(result.exitCode).toBe(1);
    expect(result.stderr).not.toContain('private-fixture');
    expect(result.stderr).not.toContain('server must not start');
  }
});
