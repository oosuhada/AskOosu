'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

interface OosuAvatarProps {
  animate?: boolean;
  interval?: number;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  variant?: 'static' | 'hover';
}

const frames = Array.from(
  { length: 23 },
  (_, index) => `/oosu-avatar/hover-${String(index + 1).padStart(2, '0')}.webp`
);

export function OosuAvatar({
  animate = false,
  interval = 120,
  className,
  imageClassName,
  priority = false,
  variant = 'static',
}: OosuAvatarProps) {
  const [frame, setFrame] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const currentFrame = useMemo(
    () => (variant === 'hover' ? frames[frame] : '/oosuhada.png'),
    [frame, variant]
  );

  useEffect(() => {
    if (variant !== 'hover' || !animate) {
      setFrame(0);
      return;
    }

    const timer = window.setInterval(() => {
      setFrame((current) => (current + 1) % frames.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [animate, interval, variant]);

  useEffect(() => {
    setImageFailed(false);
  }, [currentFrame]);

  return (
    <div
      className={cn(
        'relative isolate flex items-end justify-center overflow-hidden',
        className
      )}
      aria-label="Oosu Jang avatar"
    >
      {imageFailed ? (
        <div
          aria-hidden="true"
          className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center rounded-full border text-sm font-semibold"
        >
          OJ
        </div>
      ) : (
        <Image
          src={currentFrame}
          alt=""
          width={1080}
          height={1433}
          priority={priority}
          onError={() => setImageFailed(true)}
          className={cn(
            'h-full w-full object-contain object-bottom',
            imageClassName
          )}
        />
      )}
    </div>
  );
}
