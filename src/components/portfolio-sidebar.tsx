'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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
  ChevronDown,
  Code2,
  ExternalLink,
  FileText,
  Github,
  HelpCircle,
  Languages,
  Menu,
  MessageSquare,
  Moon,
  Plus,
  Settings,
  Sun,
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

export function PortfolioSidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  className,
}: PortfolioSidebarProps) {
  const [open, setOpen] = useState(false);
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
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        aria-label={text.menu}
        className={cn(
          'bg-background/70 text-foreground hover:bg-accent fixed top-6 left-6 z-[60] inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-sm backdrop-blur-lg transition-colors',
          className
        )}
      >
        <Menu className="h-5 w-5" />
      </DrawerTrigger>
      <DrawerContent className="w-[86vw] max-w-[380px] rounded-none">
        <DrawerHeader className="px-5 pt-6 pb-4">
          <DrawerTitle className="text-2xl">{text.menu}</DrawerTitle>
          <DrawerDescription>{text.menuDescription}</DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="min-h-0 flex-1 px-5">
          <div className="space-y-7 pb-8">
            <button
              type="button"
              onClick={handleNewChat}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            >
              <span className="flex items-center gap-3">
                <Plus className="h-4 w-4" />
                {text.newChat}
              </span>
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
                        'hover:bg-accent flex w-full flex-col rounded-lg border px-3 py-3 text-left transition-colors',
                        activeConversationId === conversation.id &&
                          'border-primary bg-accent'
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
                <p className="text-muted-foreground rounded-lg border px-3 py-4 text-sm">
                  {text.emptyChatHistory}
                </p>
              )}
            </section>

            <Separator />

            <section className="space-y-4">
              <SectionLabel icon={Settings} label={text.settings} />
              <PreferenceGroup
                icon={Languages}
                label={text.languageSetting}
                options={[
                  { label: text.korean, value: 'ko' },
                  { label: text.english, value: 'en' },
                ]}
                value={language}
                onChange={(value) =>
                  setLanguagePreference(value as DisplayLanguage)
                }
              />
              <PreferenceGroup
                icon={theme === 'dark' ? Moon : Sun}
                label={text.themeSetting}
                options={[
                  { label: text.lightMode, value: 'light' },
                  { label: text.darkMode, value: 'dark' },
                ]}
                value={theme}
                onChange={(value) => setThemePreference(value as DisplayTheme)}
              />
            </section>

            <Separator />

            <section className="space-y-3">
              <SectionLabel icon={ExternalLink} label={text.links} />
              <a
                href={oosuProfile.github}
                target="_blank"
                rel="noreferrer"
                className="hover:bg-accent flex items-center justify-between rounded-lg border px-3 py-3 text-sm transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Github className="h-4 w-4" />
                  {text.github}
                </span>
                <ExternalLink className="text-muted-foreground h-4 w-4" />
              </a>
              <div className="bg-muted/50 text-muted-foreground flex items-center justify-between rounded-lg border px-3 py-3 text-sm">
                <span className="flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  {text.resume}
                </span>
                <span className="rounded-full border px-2 py-0.5 text-xs">
                  {text.resumeComingSoon}
                </span>
              </div>
            </section>

            <Separator />

            <section className="space-y-3">
              <SectionLabel icon={HelpCircle} label={text.help} />
              <Collapsible>
                <CollapsibleTrigger className="hover:bg-accent flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left text-sm transition-colors">
                  <span className="flex items-center gap-3">
                    <Code2 className="h-4 w-4" />
                    {text.siteStackTitle}
                  </span>
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="text-muted-foreground px-3 pt-3 text-sm leading-relaxed">
                  {text.siteStackBody}
                </CollapsibleContent>
              </Collapsible>
            </section>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
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

function PreferenceGroup({
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
    <div className="space-y-2">
      <div className="text-foreground flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'hover:bg-accent flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors',
              value === option.value && 'border-primary bg-accent'
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
