import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  getEmbeddingDimensions,
  getEmbeddingModelName,
  getPositiveIntEnv,
} from './config';
import type { RagChunk } from './types';

export async function embedRagChunks(chunks: RagChunk[]) {
  const model = openai.embeddingModel(getEmbeddingModelName());
  const { embeddings } = await embedMany({
    model,
    values: chunks.map(getChunkEmbeddingInput),
    maxParallelCalls: getPositiveIntEnv('ASKOOSU_EMBEDDING_PARALLELISM', 2),
    providerOptions: getEmbeddingProviderOptions(),
  });

  return chunks.map((chunk, index) => ({
    ...chunk,
    embedding: embeddings[index],
  }));
}

export async function embedRagQuery(query: string) {
  const model = openai.embeddingModel(getEmbeddingModelName());
  const { embedding } = await embed({
    model,
    value: query,
    providerOptions: getEmbeddingProviderOptions(),
  });

  return embedding;
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
