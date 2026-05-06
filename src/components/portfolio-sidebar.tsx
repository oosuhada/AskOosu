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
  readStoredConversations,
  type StoredChatConversation,
} from '@/lib/chat-history';
import { cn } from '@/lib/utils';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import {
  Check,
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
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ElementType } from 'react';
import { useEffect, useMemo, useState } from 'react';

type PortfolioSidebarProps = {
  conversations?: StoredChatConversation[];
  activeConversationId?: string | null;
  onNewChat?: () => void;
  onSelectConversation?: (conversation: StoredChatConversation) => void;
  className?: string;
};

type UiText = ReturnType<typeof getUiText>;

export function PortfolioSidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  className,
}: PortfolioSidebarProps) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [storedConversations, setStoredConversations] = useState<
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

  const openSettings = () => {
    setSettingsOpen(true);
    setOpen(false);
  };

  const handleSelectConversation = (conversation: StoredChatConversation) => {
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

  return (
    <>
      <Drawer direction="left" open={open} onOpenChange={setOpen}>
        <aside
          className={cn(
            'bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-[60] hidden w-[72px] flex-col items-center border-r py-7 shadow-sm md:flex',
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
          className="bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent fixed top-4 left-4 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-xl border shadow-sm transition-colors md:hidden"
        >
          <Menu className="h-6 w-6" />
        </DrawerTrigger>

        <DrawerContent className="bg-sidebar text-sidebar-foreground z-[70] flex w-[min(420px,calc(100vw-24px))] max-w-none flex-col rounded-none border-r">
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
                  <div className="space-y-2">
                    {sortedConversations.map((conversation) => (
                      <button
                        type="button"
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation)}
                        className={cn(
                          'hover:bg-sidebar-accent flex w-full flex-col rounded-lg px-4 py-3 text-left transition-colors',
                          activeConversationId === conversation.id &&
                            'bg-sidebar-primary text-sidebar-primary-foreground'
                        )}
                      >
                        <span className="line-clamp-2 text-sm font-medium">
                          {conversation.title}
                        </span>
                        <span className="text-muted-foreground mt-1 text-xs">
                          {formatConversationDate(
                            conversation.updatedAt,
                            language
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sidebar-foreground/65 px-4 py-3 text-sm">
                    {text.emptyChatHistory}
                  </p>
                )}
              </section>
            </div>
          </ScrollArea>

          <div className="border-t px-6 py-5">
            <button
              type="button"
              onClick={openSettings}
              className="hover:bg-sidebar-accent flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-base font-medium transition-colors"
            >
              <Settings className="h-5 w-5" />
              {text.settings} & {text.help}
            </button>
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
          <aside className="bg-popover text-popover-foreground fixed bottom-4 left-4 z-[80] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border p-3 shadow-2xl md:left-[84px] md:w-[min(420px,calc(100vw-104px))]">
            <SettingsPanel
              text={text}
              language={language}
              theme={theme}
              onClose={() => setSettingsOpen(false)}
              onLanguageChange={setLanguagePreference}
              onThemeChange={setThemePreference}
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

function SettingsPanel({
  text,
  language,
  theme,
  onClose,
  onLanguageChange,
  onThemeChange,
}: {
  text: UiText;
  language: DisplayLanguage;
  theme: DisplayTheme;
  onClose: () => void;
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
