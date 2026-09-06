'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type ContrastMode = 'on-light' | 'on-dark' | 'mixed-light' | 'mixed-dark';

type BackdropSample = {
  luminance: number | null;
  media: boolean;
};

type BackdropAnalysis = {
  mode: ContrastMode;
  averageLuminance: number;
  mixed: boolean;
};

const LIGHT_TEXT = 'rgba(244, 244, 245, 0.92)';
const DARK_TEXT = 'rgba(24, 24, 27, 0.90)';

export function AdaptiveBackdropContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [mode, setMode] = useState<ContrastMode>('mixed-dark');

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const analysis = analyzeBackdrop(target);
      const surface = target.closest<HTMLElement>('.adaptive-quick-surface');

      if (surface) {
        surface.dataset.backdropContrast = analysis.mode;
      }

      setMode(analysis.mode);
    };

    const scheduleUpdate = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(target);

    const themeObserver = new MutationObserver(scheduleUpdate);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    window.addEventListener('scroll', scheduleUpdate, true);
    window.addEventListener('resize', scheduleUpdate);
    document.addEventListener('load', scheduleUpdate, true);

    const timers = [
      window.setTimeout(scheduleUpdate, 60),
      window.setTimeout(scheduleUpdate, 300),
      window.setTimeout(scheduleUpdate, 900),
    ];
    scheduleUpdate();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      timers.forEach(window.clearTimeout);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      const surface = target.closest<HTMLElement>('.adaptive-quick-surface');
      if (surface) delete surface.dataset.backdropContrast;
      window.removeEventListener('scroll', scheduleUpdate, true);
      window.removeEventListener('resize', scheduleUpdate);
      document.removeEventListener('load', scheduleUpdate, true);
    };
  }, []);

  return (
    <span
      ref={ref}
      data-backdrop-contrast={mode}
      className={cn('relative z-10', className)}
      style={getContrastStyle(mode)}
    >
      {children}
    </span>
  );
}

function analyzeBackdrop(target: HTMLElement): BackdropAnalysis {
  const rect = target.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return fallbackAnalysis();

  const xRatios = [0.08, 0.24, 0.4, 0.56, 0.72, 0.88];
  const yRatios = [0.38, 0.62];
  const samples: BackdropSample[] = [];

  for (const xRatio of xRatios) {
    for (const yRatio of yRatios) {
      const x = clamp(rect.left + rect.width * xRatio, 0, window.innerWidth - 1);
      const y = clamp(rect.top + rect.height * yRatio, 0, window.innerHeight - 1);
      samples.push(sampleBackdropAtPoint(target, x, y));
    }
  }

  const known = samples
    .map((sample) => sample.luminance)
    .filter((value): value is number => value !== null);
  const containsMedia = samples.some((sample) => sample.media);

  if (known.length === 0) return fallbackAnalysis();

  const average = known.reduce((sum, value) => sum + value, 0) / known.length;
  const minimum = Math.min(...known);
  const maximum = Math.max(...known);
  const spread = maximum - minimum;
  const hasMidtones = known.some((value) => value > 0.36 && value < 0.64);
  const incompleteSampling = known.length < samples.length * 0.7;
  const isMixed =
    containsMedia || spread >= 0.28 || hasMidtones || incompleteSampling;

  return {
    mode: isMixed
      ? average >= 0.52
        ? 'mixed-light'
        : 'mixed-dark'
      : average >= 0.56
        ? 'on-light'
        : 'on-dark',
    averageLuminance: average,
    mixed: isMixed,
  };
}

function sampleBackdropAtPoint(
  target: HTMLElement,
  x: number,
  y: number
): BackdropSample {
  const elements = document.elementsFromPoint(x, y);
  for (const candidate of elements) {
    if (!(candidate instanceof HTMLElement)) continue;
    if (target.contains(candidate) || candidate.contains(target)) continue;

    const element = candidate;
    if (
      element instanceof HTMLImageElement ||
      element instanceof HTMLVideoElement ||
      element instanceof HTMLCanvasElement
    ) {
      return { luminance: null, media: true };
    }

    const style = getComputedStyle(element);
    if (style.backgroundImage && style.backgroundImage !== 'none') {
      return { luminance: null, media: true };
    }

    const color = parseRgb(style.backgroundColor);
    if (color && color.alpha >= 0.2) {
      return {
        luminance: relativeLuminance(color.red, color.green, color.blue),
        media: false,
      };
    }
  }

  return { luminance: null, media: false };
}

function getContrastStyle(mode: ContrastMode): CSSProperties {
  switch (mode) {
    case 'on-light':
      return { color: DARK_TEXT };
    case 'on-dark':
      return { color: LIGHT_TEXT };
    case 'mixed-light':
      return {
        color: DARK_TEXT,
        filter: 'drop-shadow(0 1.5px 2.6px rgba(255,255,255,0.46))',
      };
    case 'mixed-dark':
      return {
        color: LIGHT_TEXT,
        filter: 'drop-shadow(0 1.5px 2.6px rgba(0,0,0,0.46))',
      };
  }
}

function themeFallback(): ContrastMode {
  if (typeof document === 'undefined') return 'mixed-dark';
  return document.documentElement.classList.contains('dark')
    ? 'mixed-dark'
    : 'mixed-light';
}

function fallbackAnalysis(): BackdropAnalysis {
  const mode = themeFallback();
  return {
    mode,
    averageLuminance: mode === 'mixed-dark' ? 0.18 : 0.82,
    mixed: true,
  };
}

function parseRgb(value: string) {
  const match = value.match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/i
  );
  if (!match) return null;

  return {
    red: Number(match[1]),
    green: Number(match[2]),
    blue: Number(match[3]),
    alpha: match[4] === undefined ? 1 : Number(match[4]),
  };
}

function relativeLuminance(red: number, green: number, blue: number) {
  const channels = [red, green, blue].map((value) => {
    const normalized = value / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
