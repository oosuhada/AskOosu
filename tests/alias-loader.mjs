import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

const candidateSuffixes = [
  '',
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.json',
  '/index.ts',
  '/index.tsx',
  '/index.js',
];

function resolveFile(candidate) {
  for (const suffix of candidateSuffixes) {
    const resolved = `${candidate}${suffix}`;
    if (!existsSync(resolved)) continue;
    try {
      if (statSync(resolved).isFile()) return resolved;
    } catch {
      // Ignore files that disappear during resolution and defer to Node.
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const resolved = resolveFile(
      path.join(repositoryRoot, 'src', specifier.slice(2))
    );
    if (resolved) {
      return { url: pathToFileURL(resolved).href, shortCircuit: true };
    }
  }

  if (
    context.parentURL?.startsWith('file:') &&
    (specifier.startsWith('./') || specifier.startsWith('../'))
  ) {
    const parentDirectory = path.dirname(fileURLToPath(context.parentURL));
    const resolved = resolveFile(path.resolve(parentDirectory, specifier));
    if (resolved) {
      return { url: pathToFileURL(resolved).href, shortCircuit: true };
    }
  }

  return nextResolve(specifier, context);
}
