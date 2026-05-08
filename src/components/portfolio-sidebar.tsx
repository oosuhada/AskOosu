'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getUiText } from '@/lib/i18n';
import { oosuProfile } from '@/lib/oosu-profile';
import type { DisplayLanguage, DisplayTheme } from '@/lib/preferences';
import {
  archiveAllStoredConversations,
  archiveStoredConversation,
  clearArchivedConversations,
  deleteArchivedConversation,
  readArchivedConversations,
  readStoredConversations,
  restoreArchivedConversation,
  type StoredChatConversation,
} from '@/lib/chat-history';
import { cn } from '@/lib/utils';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import {
  Check,
  Archive,
  ArchiveRestore,
  ChevronRight,
  Code2,
  ExternalLink,
  FileText,
  Github,
  HelpCircle,
  Languages,
  Menu,
  MessageSquare,
  Moon,
  PanelLeft,
  Settings,
  SquarePen,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ElementType, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

type PortfolioSidebarProps = {
  conversations?: StoredChatConversation[];
  activeConversationId?: string | null;
  onNewChat?: () => void;
  onSelectConversation?: (conversation: StoredChatConversation) => void;
  onArchiveConversation?: (conversationId: string) => void;
  onArchiveAllConversations?: () => void;
  onConversationsChange?: (conversations: StoredChatConversation[]) => void;
  className?: string;
};

type UiText = ReturnType<typeof getUiText>;

export function PortfolioSidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onArchiveConversation,
  onArchiveAllConversations,
  onConversationsChange,
  className,
}: PortfolioSidebarProps) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [jiggleMode, setJiggleMode] = useState(false);
  const [storedConversations, setStoredConversations] = useState<
    StoredChatConversation[]
  >([]);
  const [archivedConversations, setArchivedConversations] = useState<
    StoredChatConversation[]
  >([]);
  const router = useRouter();
  const { language, theme, setLanguagePreference, setThemePreference } =
    useDisplayPreferences();
  const text = getUiText(language);

  useEffect(() => {
    if (open && conversations === undefined) {
      setStoredConversations(readStoredConversations());
    }
  }, [conversations, open]);

  useEffect(() => {
    if (settingsOpen || archiveOpen) {
      setArchivedConversations(readArchivedConversations());
    }
  }, [archiveOpen, settingsOpen]);

  const displayedConversations = conversations ?? storedConversations;

  const sortedConversations = useMemo(
    () =>
      [...displayedConversations].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [displayedConversations]
  );

  const handleNewChat = () => {
    onNewChat?.();
    setOpen(false);
  };

  const handleDrawerOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && jiggleMode) {
      setJiggleMode(false);
      return;
    }

    setOpen(nextOpen);
    if (!nextOpen) setJiggleMode(false);
  };

  const openSettings = () => {
    setSettingsOpen(true);
    setOpen(false);
  };

  const handleSelectConversation = (conversation: StoredChatConversation) => {
    if (jiggleMode) return;

    if (onSelectConversation) {
      onSelectConversation(conversation);
    } else {
      const params = new URLSearchParams({
        conversationId: conversation.id,
        lang: language,
        theme,
      });

      router.push(`/chat?${params.toString()}`);
    }

    setOpen(false);
  };

  const handleArchiveConversation = (conversationId: string) => {
    if (onArchiveConversation) {
      onArchiveConversation(conversationId);
    } else {
      setStoredConversations(archiveStoredConversation(conversationId));
    }
    setArchivedConversations(readArchivedConversations());
  };

  const handleArchiveAllConversations = () => {
    if (onArchiveAllConversations) {
      onArchiveAllConversations();
    } else {
      setStoredConversations(archiveAllStoredConversations());
    }
    setArchivedConversations(readArchivedConversations());
    setJiggleMode(false);
  };

  const handleRestoreConversation = (conversationId: string) => {
    const { activeConversations, archivedConversations: nextArchived } =
      restoreArchivedConversation(conversationId);
    setArchivedConversations(nextArchived);
    setStoredConversations(activeConversations);
    onConversationsChange?.(activeConversations);
  };

  const handleDeleteArchivedConversation = (conversationId: string) => {
    setArchivedConversations(deleteArchivedConversation(conversationId));
  };

  const handleClearArchive = () => {
    setArchivedConversations(clearArchivedConversations());
  };

  const openArchive = () => {
    setArchiveOpen(true);
    setSettingsOpen(false);
    setArchivedConversations(readArchivedConversations());
  };

  return (
    <>
      <Drawer direction="left" open={open} onOpenChange={handleDrawerOpenChange}>
        <aside
          className={cn(
            'text-sidebar-foreground bg-background/50 fixed inset-y-0 left-0 z-[60] hidden w-[72px] flex-col items-center border-r border-white/45 py-7 shadow-[inset_1px_0_0_rgba(255,255,255,0.18),0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl md:flex dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[inset_1px_0_0_rgba(255,255,255,0.08),0_18px_50px_rgba(0,0,0,0.35)]',
            className
          )}
        >
          <DrawerTrigger
            aria-label={text.menu}
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6" />
          </DrawerTrigger>

          <button
            type="button"
            onClick={handleNewChat}
            aria-label={text.newChat}
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mt-7 inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors"
          >
            <SquarePen className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={openSettings}
            aria-label={text.settings}
            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mt-auto inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors"
          >
            <Settings className="h-6 w-6" />
          </button>
        </aside>

        <DrawerTrigger
          aria-label={text.menu}
          className="text-sidebar-foreground bg-background/50 hover:bg-background/65 fixed top-4 left-4 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-2xl transition-colors md:hidden dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_30px_rgba(0,0,0,0.32)] dark:hover:bg-white/[0.12]"
        >
          <Menu className="h-6 w-6" />
        </DrawerTrigger>

        <DrawerContent
          className="text-sidebar-foreground bg-background/70 z-[70] flex w-[min(420px,calc(100vw-24px))] max-w-none flex-col rounded-none border-r border-white/45 shadow-[inset_1px_0_0_rgba(255,255,255,0.16),0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[inset_1px_0_0_rgba(255,255,255,0.08),0_24px_70px_rgba(0,0,0,0.42)]"
          onPointerDownOutside={(event) => {
            event.preventDefault();
            if (jiggleMode) {
              setJiggleMode(false);
              return;
            }

            setOpen(false);
          }}
        >
          <DrawerHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-5">
            <DrawerTitle className="flex items-center gap-3 text-2xl">
              <PanelLeft className="h-5 w-5" />
              {text.menu}
            </DrawerTitle>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={text.close}
              className="hover:bg-sidebar-accent inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </DrawerHeader>

          <ScrollArea className="min-h-0 flex-1 px-6">
            <div className="space-y-8 pb-8">
              <button
                type="button"
                onClick={handleNewChat}
                className="hover:bg-sidebar-accent flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-base font-medium transition-colors"
              >
                <SquarePen className="h-5 w-5" />
                {text.newChat}
              </button>

              <section className="space-y-3">
                <SectionLabel icon={MessageSquare} label={text.chatHistory} />
                {sortedConversations.length > 0 ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {sortedConversations.map((conversation) => (
                        <ConversationHistoryItem
                          key={conversation.id}
                          conversation={conversation}
                          isActive={activeConversationId === conversation.id}
                          isJiggling={jiggleMode}
                          language={language}
                          text={text}
                          onSelect={handleSelectConversation}
                          onArchive={handleArchiveConversation}
                          onLongPress={() => setJiggleMode(true)}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleArchiveAllConversations}
                      className="text-muted-foreground hover:text-destructive flex w-full items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-medium transition-colors hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      {text.deleteAll}
                    </button>
                  </div>
                ) : (
                  <p className="text-sidebar-foreground/65 px-4 py-3 text-sm">
                    {text.emptyChatHistory}
                  </p>
                )}
              </section>
            </div>
          </ScrollArea>

          <div className="border-t border-white/40 px-6 py-5 dark:border-white/10">
            <div className="grid gap-2">
              {jiggleMode && (
                <button
                  type="button"
                  onClick={() => setJiggleMode(false)}
                  className="hover:bg-sidebar-accent flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors"
                >
                  <Check className="h-5 w-5" />
                  {text.done}
                </button>
              )}
              <button
                type="button"
                onClick={openSettings}
                className="hover:bg-sidebar-accent flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-base font-medium transition-colors"
              >
                <Settings className="h-5 w-5" />
                {text.settings} & {text.help}
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {settingsOpen && (
        <>
          <button
            type="button"
            aria-label={text.close}
            className="fixed inset-0 z-[70] cursor-default bg-transparent"
            onClick={() => setSettingsOpen(false)}
          />
          <aside className="text-popover-foreground bg-background/70 fixed bottom-4 left-4 z-[80] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-white/45 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl md:left-[84px] md:w-[min(420px,calc(100vw-104px))] dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_70px_rgba(0,0,0,0.42)]">
            <SettingsPanel
              text={text}
              language={language}
              theme={theme}
              onClose={() => setSettingsOpen(false)}
              onOpenArchive={openArchive}
              onLanguageChange={setLanguagePreference}
              onThemeChange={setThemePreference}
            />
          </aside>
        </>
      )}

      {archiveOpen && (
        <>
          <button
            type="button"
            aria-label={text.close}
            className="fixed inset-0 z-[70] cursor-default bg-transparent"
            onClick={() => setArchiveOpen(false)}
          />
          <aside className="text-popover-foreground bg-background/70 fixed bottom-4 left-4 z-[80] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-white/45 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl md:left-[84px] md:w-[min(420px,calc(100vw-104px))] dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_70px_rgba(0,0,0,0.42)]">
            <ArchivePanel
              text={text}
              language={language}
              conversations={archivedConversations}
              onClose={() => setArchiveOpen(false)}
              onRestore={handleRestoreConversation}
              onDelete={handleDeleteArchivedConversation}
              onClear={handleClearArchive}
            />
          </aside>
        </>
      )}
    </>
  );
}

function SectionLabel({
  icon: Icon,
  label,
}: {
  icon: ElementType;
  label: string;
}) {
  return (
    <h2 className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.08em] uppercase">
      <Icon className="h-4 w-4" />
      {label}
    </h2>
  );
}

function ConversationHistoryItem({
  conversation,
  isActive,
  isJiggling,
  language,
  text,
  onSelect,
  onArchive,
  onLongPress,
}: {
  conversation: StoredChatConversation;
  isActive: boolean;
  isJiggling: boolean;
  language: DisplayLanguage;
  text: UiText;
  onSelect: (conversation: StoredChatConversation) => void;
  onArchive: (conversationId: string) => void;
  onLongPress: () => void;
}) {
  const [isDeleteRevealed, setIsDeleteRevealed] = useState(false);
  const startXRef = useRef(0);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLongPressTimer = () => {
    if (!longPressTimerRef.current) return;
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    startXRef.current = event.clientX;
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      setIsDeleteRevealed(false);
      onLongPress();
    }, 520);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const deltaX = event.clientX - startXRef.current;
    if (Math.abs(deltaX) > 12) clearLongPressTimer();
    if (deltaX > 44) setIsDeleteRevealed(true);
    if (deltaX < -24) setIsDeleteRevealed(false);
  };

  const handlePointerEnd = () => {
    clearLongPressTimer();
  };

  const handleSelect = () => {
    if (isJiggling || isDeleteRevealed) {
      setIsDeleteRevealed(false);
      return;
    }
    onSelect(conversation);
  };

  return (
    <div
      data-testid={`conversation-row-${conversation.id}`}
      className={cn(
        'group relative overflow-visible rounded-lg',
        isJiggling && 'askoosu-jiggle'
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
    >
      <button
        type="button"
        data-testid={`conversation-delete-${conversation.id}`}
        onClick={() => onArchive(conversation.id)}
        aria-label={text.deleteConversation}
        className={cn(
          'bg-destructive text-destructive-foreground absolute inset-y-0 left-0 z-0 flex w-16 items-center justify-center rounded-lg transition-opacity',
          isDeleteRevealed
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
      >
        <Trash2 className="h-5 w-5" />
      </button>

      {isJiggling && (
        <button
          type="button"
          data-testid={`conversation-jiggle-delete-${conversation.id}`}
          onClick={() => onArchive(conversation.id)}
          aria-label={text.deleteConversation}
          className="bg-destructive text-destructive-foreground absolute -top-2 -right-2 z-30 inline-flex h-6 w-6 items-center justify-center rounded-full shadow-sm ring-2 ring-background"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <button
        type="button"
        data-testid={`conversation-select-${conversation.id}`}
        onClick={handleSelect}
        className={cn(
          'relative z-10 flex w-full flex-col rounded-lg bg-background/85 px-4 py-3 text-left shadow-[0_1px_0_rgba(255,255,255,0.18)] transition-transform hover:bg-white/60 dark:bg-background/80 dark:hover:bg-white/[0.07]',
          isDeleteRevealed && 'translate-x-16',
          isActive &&
            'text-foreground bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] dark:bg-white/[0.1]'
        )}
      >
        <span className="line-clamp-2 text-sm font-medium">
          {conversation.title}
        </span>
        <span className="text-muted-foreground mt-1 text-xs">
          {formatConversationDate(conversation.updatedAt, language)}
        </span>
      </button>
    </div>
  );
}

function SettingsPanel({
  text,
  language,
  theme,
  onClose,
  onOpenArchive,
  onLanguageChange,
  onThemeChange,
}: {
  text: UiText;
  language: DisplayLanguage;
  theme: DisplayTheme;
  onClose: () => void;
  onOpenArchive: () => void;
  onLanguageChange: (value: DisplayLanguage) => void;
  onThemeChange: (value: DisplayTheme) => void;
}) {
  const ThemeIcon = theme === 'dark' ? Moon : Sun;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Settings className="h-4 w-4" />
          {text.settings} & {text.help}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={text.close}
          className="hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <InlinePreferenceRow
        icon={Languages}
        label={text.languageSetting}
        options={[
          { label: text.korean, value: 'ko' },
          { label: text.english, value: 'en' },
        ]}
        value={language}
        onChange={(value) => onLanguageChange(value as DisplayLanguage)}
      />

      <InlinePreferenceRow
        icon={ThemeIcon}
        label={text.themeSetting}
        options={[
          { label: text.lightMode, value: 'light' },
          { label: text.darkMode, value: 'dark' },
        ]}
        value={theme}
        onChange={(value) => onThemeChange(value as DisplayTheme)}
      />

      <Separator className="my-2" />

      <button
        type="button"
        onClick={onOpenArchive}
        className="hover:bg-accent flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm transition-colors"
      >
        <span className="flex items-center gap-3">
          <Archive className="text-muted-foreground h-5 w-5" />
          {text.archive}
        </span>
        <ChevronRight className="text-muted-foreground h-4 w-4" />
      </button>

      <a
        href={oosuProfile.github}
        target="_blank"
        rel="noreferrer"
        className="hover:bg-accent flex items-center justify-between rounded-lg px-3 py-3 text-sm transition-colors"
      >
        <span className="flex items-center gap-3">
          <Github className="text-muted-foreground h-5 w-5" />
          {text.github}
        </span>
        <ExternalLink className="text-muted-foreground h-4 w-4" />
      </a>

      <div
        aria-disabled="true"
        className="text-muted-foreground flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm"
      >
        <span className="flex min-w-0 items-center gap-3">
          <FileText className="h-5 w-5 shrink-0" />
          <span className="min-w-0">
            <span className="block">{text.resume}</span>
            <span className="block truncate text-xs">
              {text.resumeKorean} · {text.resumeEnglish}
            </span>
          </span>
        </span>
        <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs">
          {text.resumeComingSoon}
        </span>
      </div>

      <details className="group">
        <summary className="hover:bg-accent flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-3 text-sm transition-colors [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-3">
            <HelpCircle className="text-muted-foreground h-5 w-5" />
            {text.help}
          </span>
          <ChevronRight className="text-muted-foreground h-4 w-4 transition-transform group-open:rotate-90" />
        </summary>
        <div className="text-muted-foreground px-3 pt-1 pb-3 text-sm leading-relaxed">
          <div className="text-foreground mb-2 flex items-center gap-2 font-medium">
            <Code2 className="h-4 w-4" />
            {text.siteStackTitle}
          </div>
          {text.siteStackBody}
        </div>
      </details>
    </div>
  );
}

function ArchivePanel({
  text,
  language,
  conversations,
  onClose,
  onRestore,
  onDelete,
  onClear,
}: {
  text: UiText;
  language: DisplayLanguage;
  conversations: StoredChatConversation[];
  onClose: () => void;
  onRestore: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Archive className="h-4 w-4" />
          {text.archive}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={text.close}
          className="hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {conversations.length > 0 ? (
        <>
          <div className="max-h-[52vh] space-y-2 overflow-y-auto px-1 py-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                data-testid={`archived-conversation-${conversation.id}`}
                className="bg-background/50 rounded-lg border border-white/35 px-3 py-3 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium">
                    {conversation.title}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatConversationDate(
                      conversation.archivedAt ?? conversation.updatedAt,
                      language
                    )}
                  </p>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    data-testid={`archive-restore-${conversation.id}`}
                    onClick={() => onRestore(conversation.id)}
                    className="hover:bg-accent inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs transition-colors"
                  >
                    <ArchiveRestore className="h-3.5 w-3.5" />
                    {text.restore}
                  </button>
                  <button
                    type="button"
                    data-testid={`archive-delete-${conversation.id}`}
                    onClick={() => onDelete(conversation.id)}
                    className="text-destructive hover:bg-destructive/10 inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {text.deleteForever}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-2" />
          <button
            type="button"
            onClick={onClear}
            className="text-destructive hover:bg-destructive/10 mx-1 flex w-[calc(100%-0.5rem)] items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            {text.clearArchive}
          </button>
        </>
      ) : (
        <p className="text-muted-foreground px-3 py-8 text-center text-sm">
          {text.emptyArchive}
        </p>
      )}
    </div>
  );
}

function InlinePreferenceRow({
  icon: Icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: ElementType;
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-3">
      <div className="flex items-center gap-3 text-sm">
        <Icon className="text-muted-foreground h-5 w-5" />
        {label}
      </div>
      <div className="flex shrink-0 rounded-lg border p-0.5">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'hover:bg-accent inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs transition-colors',
              value === option.value && 'bg-accent text-accent-foreground'
            )}
          >
            {option.label}
            {value === option.value && <Check className="h-4 w-4" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatConversationDate(isoDate: string, language: DisplayLanguage) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
