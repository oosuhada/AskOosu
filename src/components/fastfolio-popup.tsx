'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookOpen, Database, Github, MessageSquare } from 'lucide-react';
import { OosuAvatar } from '@/components/oosu-avatar';
import { oosuProfile } from '@/lib/oosu-profile';
import { PoweredByFastfolio } from './powered-by-fastfolio';

interface FastfolioPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasReachedLimit?: boolean;
}

export function FastfolioPopup({
  open,
  onOpenChange,
  hasReachedLimit = false,
}: FastfolioPopupProps) {
  const handleCTA = () => {
    window.open(oosuProfile.notionWikiUrl, '_blank');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-none p-0 sm:max-w-[500px]">
        <div className="bg-accent flex h-[200px] items-center justify-center">
          <OosuAvatar
            variant="hover"
            animate
            interval={1000}
            frameStep={3}
            className="h-32 w-32"
          />
        </div>

        <div className="space-y-8 p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {hasReachedLimit ? (
                <>AskOosu is still being tuned</>
              ) : (
                <>
                  AskOosu <span className="text-[#4c55fa]">Knowledge Wiki</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-5 w-5 text-[#4c55fa]" />
              <div>
                <p className="text-sm font-medium">
                  Conversational portfolio Q&A
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Database className="mt-0.5 h-5 w-5 text-[#4c55fa]" />
              <div>
                <p className="text-sm font-medium">
                  Notion wiki as the planned knowledge source
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Github className="mt-0.5 h-5 w-5 text-[#4c55fa]" />
              <div>
                <p className="text-sm font-medium">
                  GitHub project history connected to the portfolio
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 h-5 w-5 text-[#4c55fa]" />
              <div>
                <p className="text-sm font-medium">
                  Korean and English resume pages can be added later
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCTA}
              className="flex-1 cursor-pointer border-none bg-[#4c55fa] hover:bg-[#4c55fa]/80"
            >
              Open AskOosu Wiki
            </Button>
          </div>

          <PoweredByFastfolio />
        </div>
      </DialogContent>
    </Dialog>
  );
}
