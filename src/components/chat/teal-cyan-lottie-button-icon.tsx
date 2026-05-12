'use client';

import { Player } from '@lordicon/react';
import { Square } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import tealCyanIcon from '../../../public/lottie_Tealcyan.json';

type TealCyanLottieButtonIconProps = {
  isLoading?: boolean;
  size?: number;
};

export function TealCyanLottieButtonIcon({
  isLoading = false,
  size = 42,
}: TealCyanLottieButtonIconProps) {
  const playerRef = useRef<Player>(null);

  useEffect(() => {
    playerRef.current?.playFromBeginning();
  }, [isLoading]);

  return (
    <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
      <Player
        ref={playerRef}
        icon={tealCyanIcon}
        size={size}
        onReady={() => playerRef.current?.playFromBeginning()}
        onComplete={() => playerRef.current?.playFromBeginning()}
      />
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/10 backdrop-blur-[1px]">
          <Square className="h-4 w-4 fill-white text-white drop-shadow-sm" />
        </span>
      )}
    </span>
  );
}
