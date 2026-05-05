// src/components/chat/chat-bottombar.tsx
'use client';

import type { ChatRequestOptions } from 'ai';
import { motion } from 'framer-motion';
import { ArrowUp, Square } from 'lucide-react';
import React, { useEffect } from 'react';

interface ChatBottombarProps {
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  isLoading: boolean;
  stop: () => void;
  input: string;
  isToolInProgress: boolean;
  disabled?: boolean;
  placeholder?: string;
  thinkingLabel?: string;
}

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  isToolInProgress,
  disabled = false,
  placeholder = 'Ask Oosu anything...',
  thinkingLabel = 'Drafting the answer...',
}: ChatBottombarProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      !isToolInProgress &&
      input.trim()
    ) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    inputEl.style.height = '0px';
    inputEl.style.height = `${Math.min(inputEl.scrollHeight, 144)}px`;
  }, [input]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className="w-full pb-3 md:pb-5"
    >
      <form onSubmit={handleSubmit} className="relative w-full md:px-4">
        <div className="bg-background/50 mx-auto flex min-h-14 items-center rounded-3xl border border-white/55 py-2 pr-2 pl-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_36px_rgba(15,23,42,0.14)] backdrop-blur-2xl transition-colors md:min-h-12 md:rounded-full md:pl-6 dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_40px_rgba(0,0,0,0.32)]">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={
              disabled
                ? ''
                : isToolInProgress || isLoading
                  ? thinkingLabel
                  : placeholder
            }
            aria-label={placeholder}
            className={`placeholder:text-muted-foreground/80 max-h-36 min-h-8 w-full resize-none border-none bg-transparent py-1.5 text-base leading-5 focus:outline-none md:text-sm ${
              disabled ? 'text-muted-foreground font-medium' : 'text-foreground'
            }`}
            disabled={isToolInProgress || isLoading || disabled}
          />

          <button
            type="submit"
            disabled={
              !isLoading && (!input.trim() || isToolInProgress || disabled)
            }
            aria-label={isLoading ? 'Stop response' : 'Send message'}
            className="focus-visible:ring-ring/50 mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0171E3] text-white outline-none focus-visible:ring-[3px] disabled:opacity-50 md:h-9 md:w-9"
            onClick={(e) => {
              if (isLoading) {
                e.preventDefault();
                stop();
              }
            }}
          >
            {isLoading ? (
              <Square className="h-5 w-5 fill-current" />
            ) : (
              <ArrowUp className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
