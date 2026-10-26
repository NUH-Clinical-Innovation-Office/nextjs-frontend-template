import { readFileSync } from 'node:fs';

// The runtime image has no shell. Load Vault's JSON before Next.js validates env.
const secretsFile = process.env.VAULT_SECRETS_FILE;
if (secretsFile) {
  let secrets;
  try {
    secrets = JSON.parse(readFileSync(secretsFile, 'utf8'));
  } catch {
    throw new Error('Unable to read VAULT_SECRETS_FILE as JSON');
  }
  if (
    secrets === null ||
    typeof secrets !== 'object' ||
    Array.isArray(secrets) ||
    Object.entries(secrets).some(
      ([key, value]) => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || typeof value !== 'string',
    )
  ) {
    throw new Error('Vault secrets must be an object containing environment variable strings');
  }
  for (const [key, value] of Object.entries(secrets)) {
    process.env[key] ??= value;
  }
}

const serverPath = new URL('./server.js', import.meta.url);
await import(serverPath.href);
