'use client';

import React from 'react';
import { Photos, PhotoItem } from './photos';

const Crazy = () => {
  const sportPhotos: PhotoItem[] = [
    {
      src: '/oosu-avatar/hover-23.webp',
      alt: 'AskOosu animated avatar frame',
      caption:
        'AskOosu uses Oosu profile frames as a lightweight conversational identity.',
    },
  ];

  return (
    <div className="mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-foreground text-3xl font-semibold md:text-4xl">
          AskOosu Identity
        </h2>
        <p className="text-muted-foreground mt-4">
          A reusable legacy section, now customized as a compact visual story
          about the 2026 conversational portfolio.
        </p>
      </div>
      <Photos photos={sportPhotos} />
    </div>
  );
};

export default Crazy;
