import {
  DEFAULT_CHUNK_OVERLAP,
  DEFAULT_CHUNK_SIZE,
  getPositiveIntEnv,
} from './config';
import type { RagChunk } from './types';

type ChunkInput = Omit<RagChunk, 'contentHash'>;

export function createRagChunk(input: ChunkInput): RagChunk {
  return {
    ...input,
    contentHash: hashString(`${input.id}:${input.title}:${input.text}`),
  };
}

export function chunkLongText(input: ChunkInput) {
  const normalizedText = normalizeText(input.text);
  if (!normalizedText) return [];

  const maxLength = getPositiveIntEnv(
    'ASKOOSU_RAG_CHUNK_SIZE',
    DEFAULT_CHUNK_SIZE
  );
  const overlap = getPositiveIntEnv(
    'ASKOOSU_RAG_CHUNK_OVERLAP',
    DEFAULT_CHUNK_OVERLAP
  );

  if (normalizedText.length <= maxLength) {
    return [createRagChunk({ ...input, text: normalizedText })];
  }

  const chunks: RagChunk[] = [];
  let start = 0;
  let index = 1;

  while (start < normalizedText.length) {
    const end = Math.min(start + maxLength, normalizedText.length);
    const text = normalizedText.slice(start, end);

    chunks.push(
      createRagChunk({
        ...input,
        id: `${input.id}-${index}`,
        title: `${input.title} ${index}`,
        text,
        metadata: {
          ...input.metadata,
          chunkIndex: index,
        },
      })
    );

    if (end === normalizedText.length) break;
    start = Math.max(0, end - overlap);
    index += 1;
  }

  return chunks;
}

export function dedupeChunks(chunks: RagChunk[]) {
  const seen = new Set<string>();

  return chunks.filter((chunk) => {
    const key = `${chunk.title}:${chunk.text.slice(0, 120)}`;
    if (seen.has(key) || !chunk.text.trim()) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function tokenize(value: string) {
  return Array.from(new Set(value.match(/[a-z0-9가-힣]{2,}/gi) ?? []));
}

export function parseNotionId(input: string) {
  const normalizedInput = input.trim();
  const matches = normalizedInput.match(/[0-9a-fA-F]{32}/g);
  const id = matches?.at(-1) ?? normalizedInput.replaceAll('-', '');

  if (!/^[0-9a-fA-F]{32}$/.test(id)) return '';

  return id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}

export function hashString(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}
