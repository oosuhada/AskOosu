import { spawn } from 'node:child_process';
import process from 'node:process';

const mode = process.argv[2];
if (!['browser', 'ai'].includes(mode)) {
  console.error('Usage: node tests/run-with-app.mjs <browser|ai>');
  process.exit(2);
}

const port = Number(process.env.ASKOOSU_TEST_PORT || 3210);
const baseUrl = `http://127.0.0.1:${port}`;
const childEnvironment = {
  ...process.env,
  HOSTNAME: '127.0.0.1',
  PORT: String(port),
  ASKOOSU_RATE_LIMIT_STORE: 'memory',
  NEXT_TELEMETRY_DISABLED: '1',
};

const app = spawn(
  'corepack',
  ['pnpm', 'exec', 'next', 'start', '-H', '127.0.0.1', '-p', String(port)],
  { env: childEnvironment, stdio: ['ignore', 'pipe', 'pipe'] }
);

app.stdout.pipe(process.stdout);
app.stderr.pipe(process.stderr);

async function waitForHealth() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (app.exitCode !== null) {
      throw new Error(`AskOosu server exited before health check: ${app.exitCode}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${baseUrl}/api/health`);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...childEnvironment, ASKOOSU_EVAL_BASE_URL: baseUrl },
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited ${code}`));
    });
  });
}

try {
  await waitForHealth();
  if (mode === 'browser') {
    await run(process.execPath, ['tests/e2e/browser-journey.mjs', baseUrl]);
  } else {
    await run('corepack', [
      'pnpm',
      'faq:eval',
      '--',
      '--strict',
      '--base-url',
      baseUrl,
    ]);
    await run('corepack', [
      'pnpm',
      'rag:eval',
      '--',
      '--failure-only',
      '--strict',
      '--base-url',
      baseUrl,
    ]);
  }
} finally {
  app.kill('SIGTERM');
  await Promise.race([
    new Promise((resolve) => app.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  if (app.exitCode === null) app.kill('SIGKILL');
}
