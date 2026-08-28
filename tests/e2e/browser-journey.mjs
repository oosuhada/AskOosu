import assert from 'node:assert/strict';
import { existsSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const baseUrl = process.argv[2] || 'http://127.0.0.1:3210';
const chrome = findChrome();
assert.ok(chrome, 'Chrome/Chromium executable not found. Set CHROME_PATH.');

const debuggingPort = 9229;
const profileDirectory = path.join(
  os.tmpdir(),
  `askoosu-cdp-${process.pid}-${Date.now()}`
);
const chromeProcess = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--no-sandbox',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${profileDirectory}`,
    baseUrl,
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] }
);

let chromeErrors = '';
chromeProcess.stderr.on('data', (chunk) => {
  chromeErrors += chunk.toString();
});

try {
  const target = await waitForPageTarget(debuggingPort);
  const cdp = await createCdpClient(target.webSocketDebuggerUrl);
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');

  await waitForCondition(cdp, `Boolean(document.querySelector('a[aria-label^="Ask starter question:"]'))`);
  const starter = await cdp.evaluate(`(() => {
    const link = document.querySelector('a[aria-label^="Ask starter question:"]');
    return { label: link?.getAttribute('aria-label') || '', href: link?.href || '' };
  })()`);
  assert.ok(starter?.href, 'No starter-question link was rendered.');

  await cdp.evaluate(`document.querySelector('a[aria-label^="Ask starter question:"]')?.click()`);
  await waitForCondition(cdp, `location.pathname === '/chat'`);
  await waitForCondition(
    cdp,
    `Boolean(document.querySelector('[aria-label="Portfolio sources"]')) || document.body.innerText.includes('포트폴리오 답변 근거') || document.body.innerText.includes('Portfolio answer evidence')`,
    25_000
  );

  const result = await cdp.evaluate(`(() => ({
    path: location.pathname,
    text: document.body.innerText,
    sourcePanel: Boolean(document.querySelector('[aria-label="Portfolio sources"]')),
    evidenceHeading: document.body.innerText.includes('포트폴리오 답변 근거') || document.body.innerText.includes('Portfolio answer evidence'),
    markdownBlocks: document.querySelectorAll('.prose').length
  }))()`);

  assert.equal(result.path, '/chat');
  assert.ok(
    result.sourcePanel || result.evidenceHeading,
    'The answer rendered without its portfolio evidence surface.'
  );
  assert.match(result.text, /(Oosu|우수)/, 'No portfolio answer text rendered.');
  assert.equal(result.text.includes('SYSTEM_PROMPT'), false);
  assert.equal(result.text.includes('Retrieved Wiki Context'), false);

  console.log(`Browser E2E passed: ${starter.label}`);
  console.log(`Evidence surface: ${result.sourcePanel ? 'sources' : 'evidence heading'}`);
  cdp.close();
} catch (error) {
  if (chromeErrors) console.error(chromeErrors.slice(-4000));
  throw error;
} finally {
  chromeProcess.kill('SIGTERM');
  await Promise.race([
    new Promise((resolve) => chromeProcess.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  if (chromeProcess.exitCode === null) {
    chromeProcess.kill('SIGKILL');
    await Promise.race([
      new Promise((resolve) => chromeProcess.once('exit', resolve)),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  }
  rmSync(profileDirectory, {
    recursive: true,
    force: true,
    maxRetries: 8,
    retryDelay: 100,
  });
}

function findChrome() {
  const configured = process.env.CHROME_PATH?.trim();
  if (configured && existsSync(configured)) return configured;

  const absoluteCandidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  for (const candidate of absoluteCandidates) {
    if (existsSync(candidate)) return candidate;
  }

  for (const command of [
    'google-chrome-stable',
    'google-chrome',
    'chromium',
    'chromium-browser',
    'chrome',
  ]) {
    const lookup = spawnSync('which', [command], { encoding: 'utf8' });
    const resolved = lookup.stdout?.trim();
    if (lookup.status === 0 && resolved) return resolved;
  }
  return null;
}

async function waitForPageTarget(port) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const targets = await response.json();
        const page = targets.find((target) => target.type === 'page');
        if (page?.webSocketDebuggerUrl) return page;
      }
    } catch {
      // Chrome is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error('Timed out waiting for Chrome DevTools target.');
}

async function createCdpClient(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  let id = 0;

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (!message.id) return;
    const handler = pending.get(message.id);
    if (!handler) return;
    pending.delete(message.id);
    if (message.error) handler.reject(new Error(JSON.stringify(message.error)));
    else handler.resolve(message.result);
  });

  return {
    send(method, params = {}) {
      id += 1;
      const requestId = id;
      return new Promise((resolve, reject) => {
        pending.set(requestId, { resolve, reject });
        socket.send(JSON.stringify({ id: requestId, method, params }));
      });
    },
    async evaluate(expression) {
      const response = await this.send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (response.exceptionDetails) {
        throw new Error(response.exceptionDetails.text || 'Runtime evaluation failed');
      }
      return response.result?.value;
    },
    close() {
      socket.close();
    },
  };
}

async function waitForCondition(cdp, expression, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await cdp.evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for browser condition: ${expression}`);
}
