import type { UIMessage } from 'ai';

export type StoredChatConversation = {
  id: string;
  title: string;
  messages: UIMessage[];
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};

export const CHAT_HISTORY_STORAGE_KEY = 'ask-oosu-chat-history';
export const ARCHIVED_CHAT_HISTORY_STORAGE_KEY =
  'ask-oosu-archived-chat-history';

const MAX_STORED_CONVERSATIONS = 20;
const TITLE_MAX_LENGTH = 42;

export function createConversationId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getConversationTitle(messages: UIMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === 'user');
  const rawTitle = firstUserMessage
    ? getMessageText(firstUserMessage) || 'New chat'
    : 'New chat';

  if (rawTitle.length <= TITLE_MAX_LENGTH) return rawTitle;
  return `${rawTitle.slice(0, TITLE_MAX_LENGTH - 1)}…`;
}

export function readStoredConversations(): StoredChatConversation[] {
  return readConversationStorage(CHAT_HISTORY_STORAGE_KEY);
}

export function readArchivedConversations(): StoredChatConversation[] {
  return readConversationStorage(ARCHIVED_CHAT_HISTORY_STORAGE_KEY);
}

function readConversationStorage(storageKey: string): StoredChatConversation[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return [];

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue
      .filter(isStoredConversation)
      .map(normalizeStoredConversation);
  } catch {
    return [];
  }
}

export function writeStoredConversations(
  conversations: StoredChatConversation[]
) {
  if (typeof window === 'undefined') return;

  const sortedConversations = [...conversations]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, MAX_STORED_CONVERSATIONS);

  window.localStorage.setItem(
    CHAT_HISTORY_STORAGE_KEY,
    JSON.stringify(sortedConversations)
  );
}

export function writeArchivedConversations(
  conversations: StoredChatConversation[]
) {
  if (typeof window === 'undefined') return;

  const sortedConversations = [...conversations].sort(
    (a, b) =>
      new Date(b.archivedAt ?? b.updatedAt).getTime() -
      new Date(a.archivedAt ?? a.updatedAt).getTime()
  );

  window.localStorage.setItem(
    ARCHIVED_CHAT_HISTORY_STORAGE_KEY,
    JSON.stringify(sortedConversations)
  );
}

export function archiveStoredConversation(id: string) {
  const activeConversations = readStoredConversations();
  const conversation = activeConversations.find((item) => item.id === id);
  if (!conversation) return activeConversations;

  const archivedConversations = readArchivedConversations();
  const archivedConversation = {
    ...conversation,
    archivedAt: new Date().toISOString(),
  };
  const nextActiveConversations = activeConversations.filter(
    (item) => item.id !== id
  );
  const nextArchivedConversations = [
    archivedConversation,
    ...archivedConversations.filter((item) => item.id !== id),
  ];

  writeStoredConversations(nextActiveConversations);
  writeArchivedConversations(nextArchivedConversations);
  return nextActiveConversations;
}

export function deleteStoredConversation(id: string) {
  const nextActiveConversations = readStoredConversations().filter(
    (item) => item.id !== id
  );
  writeStoredConversations(nextActiveConversations);
  return nextActiveConversations;
}

export function archiveAllStoredConversations() {
  const activeConversations = readStoredConversations();
  if (activeConversations.length === 0) return [];

  const now = new Date().toISOString();
  const archivedConversations = readArchivedConversations();
  const archivedIds = new Set(activeConversations.map((item) => item.id));
  const nextArchivedConversations = [
    ...activeConversations.map((conversation) => ({
      ...conversation,
      archivedAt: now,
    })),
    ...archivedConversations.filter((item) => !archivedIds.has(item.id)),
  ];

  writeStoredConversations([]);
  writeArchivedConversations(nextArchivedConversations);
  return [];
}

export function restoreArchivedConversation(id: string) {
  const archivedConversations = readArchivedConversations();
  const conversation = archivedConversations.find((item) => item.id === id);
  if (!conversation) {
    return {
      activeConversations: readStoredConversations(),
      archivedConversations,
    };
  }

  const restoredConversation: StoredChatConversation = {
    id: conversation.id,
    title: conversation.title,
    messages: conversation.messages,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
  const activeConversations = readStoredConversations();
  const nextActiveConversations = upsertConversationWithoutTimestamp({
    conversations: activeConversations,
    conversation: {
      ...restoredConversation,
      updatedAt: new Date().toISOString(),
    },
  });
  const nextArchivedConversations = archivedConversations.filter(
    (item) => item.id !== id
  );

  writeStoredConversations(nextActiveConversations);
  writeArchivedConversations(nextArchivedConversations);
  return {
    activeConversations: nextActiveConversations,
    archivedConversations: nextArchivedConversations,
  };
}

export function deleteArchivedConversation(id: string) {
  const nextArchivedConversations = readArchivedConversations().filter(
    (item) => item.id !== id
  );
  writeArchivedConversations(nextArchivedConversations);
  return nextArchivedConversations;
}

export function clearArchivedConversations() {
  writeArchivedConversations([]);
  return [];
}

export function upsertStoredConversation({
  conversations,
  id,
  messages,
}: {
  conversations: StoredChatConversation[];
  id: string;
  messages: UIMessage[];
}) {
  const now = new Date().toISOString();
  const existingConversation = conversations.find(
    (conversation) => conversation.id === id
  );
  const nextConversation: StoredChatConversation = {
    id,
    title: getConversationTitle(messages),
    messages,
    createdAt: existingConversation?.createdAt ?? now,
    updatedAt: now,
  };

  return [
    nextConversation,
    ...conversations.filter((conversation) => conversation.id !== id),
  ];
}

function upsertConversationWithoutTimestamp({
  conversations,
  conversation,
}: {
  conversations: StoredChatConversation[];
  conversation: StoredChatConversation;
}) {
  return [
    conversation,
    ...conversations.filter((item) => item.id !== conversation.id),
  ];
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

function isStoredConversation(value: unknown): value is StoredChatConversation {
  if (!value || typeof value !== 'object') return false;

  const conversation = value as StoredChatConversation;

  return (
    typeof conversation.id === 'string' &&
    typeof conversation.title === 'string' &&
    Array.isArray(conversation.messages) &&
    typeof conversation.createdAt === 'string' &&
    typeof conversation.updatedAt === 'string' &&
    (conversation.archivedAt === undefined ||
      typeof conversation.archivedAt === 'string')
  );
}

function normalizeStoredConversation(
  conversation: StoredChatConversation
): StoredChatConversation {
  return {
    ...conversation,
    messages: conversation.messages.map(normalizeMessage),
  };
}

function normalizeMessage(message: UIMessage) {
  if (Array.isArray(message.parts)) return message;

  const legacyMessage = message as UIMessage & { content?: string };

  return {
    ...message,
    parts: legacyMessage.content
      ? [
          {
            type: 'text' as const,
            text: legacyMessage.content,
          },
        ]
      : [],
  };
}
