import type { Message } from 'ai/react';

export type StoredChatConversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

export const CHAT_HISTORY_STORAGE_KEY = 'ask-oosu-chat-history';

const MAX_STORED_CONVERSATIONS = 20;
const TITLE_MAX_LENGTH = 42;

export function createConversationId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getConversationTitle(messages: Message[]) {
  const firstUserMessage = messages.find((message) => message.role === 'user');
  const rawTitle = firstUserMessage?.content?.trim() || 'New chat';

  if (rawTitle.length <= TITLE_MAX_LENGTH) return rawTitle;
  return `${rawTitle.slice(0, TITLE_MAX_LENGTH - 1)}…`;
}

export function readStoredConversations(): StoredChatConversation[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawValue = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (!rawValue) return [];

    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];

    return parsedValue.filter(isStoredConversation);
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

export function upsertStoredConversation({
  conversations,
  id,
  messages,
}: {
  conversations: StoredChatConversation[];
  id: string;
  messages: Message[];
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

function isStoredConversation(value: unknown): value is StoredChatConversation {
  if (!value || typeof value !== 'object') return false;

  const conversation = value as StoredChatConversation;

  return (
    typeof conversation.id === 'string' &&
    typeof conversation.title === 'string' &&
    Array.isArray(conversation.messages) &&
    typeof conversation.createdAt === 'string' &&
    typeof conversation.updatedAt === 'string'
  );
}
