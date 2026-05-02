'use client';

import { OosuAvatar } from '@/components/oosu-avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getUiText } from '@/lib/i18n';
import { buildChatHref } from '@/lib/navigation';
import { useDisplayPreferences } from '@/lib/use-display-preferences';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

// Added a trigger prop to accept custom triggers
interface WelcomeModalProps {
  trigger?: React.ReactNode;
}

export default function WelcomeModal({ trigger }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, theme } = useDisplayPreferences();
  const text = getUiText(language);

  // Default trigger is the logo
  const defaultTrigger = (
    <Button
      variant="ghost"
      className="bg-background/30 hover:bg-background/60 h-auto w-auto cursor-pointer rounded-2xl p-3 shadow-lg backdrop-blur-lg focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
      onClick={() => setIsOpen(true)}
    >
      <span className="text-sm font-semibold">AskOosu</span>
      <span className="sr-only">{text.welcomeTitle}</span>
    </Button>
  );

  const handleContactMe = () => {
    setIsOpen(false);
    window.location.href = buildChatHref({
      query: text.contactQuery,
      language,
      theme,
    });
  };

  return (
    <>
      {/* Use custom trigger if provided, otherwise use default */}
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        defaultTrigger
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-background z-52 max-h-[85vh] overflow-auto rounded-2xl border-none p-4 py-6 shadow-xl sm:max-w-[85vw] md:max-w-[80vw] lg:max-w-[1000px]">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-col"
          >
            {/* Header */}
            <DialogHeader className="relative flex flex-row items-start justify-between px-8 pt-8 pb-6">
              <div>
                <DialogTitle className="flex items-center gap-2 text-4xl font-bold tracking-tight">
                  {text.welcomeTitle}
                </DialogTitle>
                <DialogDescription className="mt-2 text-base">
                  {text.welcomeDescription}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="sticky top-0 right-0 cursor-pointer rounded-full bg-black p-2 text-white hover:bg-black/90 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">{text.close}</span>
              </Button>
            </DialogHeader>

            {/* Content area */}
            <div className="space-y-6 overflow-y-auto px-2 py-4 md:px-8">
              <section className="bg-accent w-full space-y-8 rounded-2xl p-8">
                <OosuAvatar interval={170} className="mx-auto h-28 w-28" />
                {/* What section */}
                <div className="space-y-3">
                  <h3 className="text-primary flex items-center gap-2 text-xl font-semibold">
                    {text.whatIsAskOosu}
                  </h3>
                  <p className="text-accent-foreground text-base leading-relaxed">
                    {text.whatIsAskOosuBody}
                  </p>
                </div>

                {/* Why section */}
                <div className="space-y-3">
                  <h3 className="text-primary flex items-center gap-2 text-xl font-semibold">
                    {text.whyThisFormat}
                  </h3>
                  <p className="text-accent-foreground text-base leading-relaxed">
                    {text.whyThisFormatBody}
                  </p>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="flex flex-col items-center px-8 pt-4 pb-0 md:pb-8">
              <Button
                onClick={() => setIsOpen(false)}
                className="h-auto rounded-full px-4 py-3"
                size="sm"
              >
                {text.startChatting}
              </Button>
              <div
                className="mt-6 flex cursor-pointer flex-wrap gap-1 text-center text-sm"
                onClick={handleContactMe}
              >
                <p className="text-muted-foreground">{text.feedback}</p>
                <div className="flex cursor-pointer items-center text-blue-500 hover:underline">
                  {text.contactMe}
                </div>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
