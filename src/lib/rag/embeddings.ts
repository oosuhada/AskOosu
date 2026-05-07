import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  getEmbeddingDimensions,
  getEmbeddingModelName,
  getPositiveIntEnv,
} from './config';
import type { RagChunk } from './types';

export async function embedRagChunks(chunks: RagChunk[]) {
  const embeddings = await embedTexts(chunks.map(getChunkEmbeddingInput));

  return chunks.map((chunk, index) => ({
    ...chunk,
    embedding: embeddings[index],
  }));
}

export async function embedRagQuery(query: string) {
  const [embedding] = await embedTexts([query]);
  return embedding;
}

export async function embedTexts(values: string[]) {
  const model = openai.embeddingModel(getEmbeddingModelName());
  const { embeddings } = await embedMany({
    model,
    values,
    maxParallelCalls: getPositiveIntEnv('ASKOOSU_EMBEDDING_PARALLELISM', 2),
    providerOptions: getEmbeddingProviderOptions(),
  });

  return embeddings;
}

export async function embedText(value: string) {
  const model = openai.embeddingModel(getEmbeddingModelName());
  const { embedding } = await embed({
    model,
    value,
    providerOptions: getEmbeddingProviderOptions(),
  });

  return embedding;
}

export function hasEmbeddingCredentials() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function getChunkEmbeddingInput(chunk: RagChunk) {
  return [chunk.title, chunk.source, chunk.text].filter(Boolean).join('\n');
}

function getEmbeddingProviderOptions() {
  const dimensions = getEmbeddingDimensions();

  return {
    openai: {
      dimensions,
    },
  };
}
