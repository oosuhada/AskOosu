'use client';

import React from 'react';
import { Photos, PhotoItem } from './photos';

const Sports = () => {
  const sportPhotos: PhotoItem[] = [
    {
      src: '/oosu-projects/portfoli-oh-2025.webp',
      alt: 'Portfoli-Oh 2025 portfolio preview',
      caption: 'Portfoli-Oh! 2025, the frontend bootcamp portfolio.',
    },
    {
      src: '/oosu-projects/onjung.webp',
      alt: 'Onjung Flutter app preview',
      caption: 'Onjung, a Flutter app for life-event money records.',
    },
    {
      src: '/oosu-projects/nomad-market.webp',
      alt: 'Nomad Market Flutter app preview',
      caption: 'Nomad Market, a cross-border marketplace app concept.',
    },
    {
      src: '/oosu-avatar/hover-12.webp',
      alt: 'Notion wiki placeholder avatar frame',
      caption:
        'Notion wiki and resume pages are planned as the next source layer.',
    },
  ];

  return (
    <div className="mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-foreground text-3xl font-semibold md:text-4xl">
          Project Visual Archive
        </h2>
        <p className="text-muted-foreground mt-4">
          This restored template section is kept as a reusable gallery for Oosu
          project screenshots, app previews, and future Notion wiki visuals.
        </p>
      </div>
      <Photos photos={sportPhotos} />
    </div>
  );
};

export default Sports;
