export type RagChunkSource = 'notion' | 'static';

export type RagRetrievalMode = 'lexical' | 'embedding' | 'hybrid';

export type RagStoreKind = 'memory' | 'postgres';

export type RagChunkMetadata = Record<
  string,
  string | number | boolean | null | undefined
>;

export type RagChunk = {
  id: string;
  title: string;
  source: RagChunkSource;
  text: string;
  contentHash: string;
  url?: string;
  metadata?: RagChunkMetadata;
  embedding?: number[];
};

export type RagSearchResult = {
  chunk: RagChunk;
  score: number;
};

export type RagSyncSummary = {
  store: RagStoreKind;
  sourceChunkCount: number;
  storedChunkCount: number;
  embeddedChunkCount: number;
  skippedEmbeddings: boolean;
  syncedAt: string;
  durationMs: number;
  warnings: string[];
};

export type RagStatus = {
  store: RagStoreKind;
  chunkCount: number;
  embeddingCount: number;
  lastSyncedAt?: string;
};

export type NotionRichText = {
  plain_text: string;
  href?: string | null;
};

export type NotionPage = {
  id: string;
  url?: string;
  properties?: Record<string, NotionProperty>;
};

export type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  [key: string]: unknown;
};

export type NotionProperty =
  | { type: 'title'; title: NotionRichText[] }
  | { type: 'rich_text'; rich_text: NotionRichText[] }
  | { type: 'select'; select?: { name: string } | null }
  | { type: 'multi_select'; multi_select: Array<{ name: string }> }
  | { type: 'status'; status?: { name: string } | null }
  | { type: 'date'; date?: { start?: string; end?: string } | null }
  | { type: 'url'; url?: string | null }
  | { type: 'email'; email?: string | null }
  | { type: 'phone_number'; phone_number?: string | null }
  | { type: 'number'; number?: number | null }
  | { type: 'checkbox'; checkbox: boolean }
  | { type: 'relation'; relation: Array<{ id: string }> }
  | { type: 'people'; people: Array<{ name?: string | null }> }
  | {
      type: 'files';
      files: Array<{
        name?: string;
        file?: { url?: string };
        external?: { url?: string };
      }>;
    }
  | { type: string };
