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

type TextTone = 'light' | 'dark';

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
  const [textTone, setTextTone] = useState<TextTone>('light');
  const [isMixed, setIsMixed] = useState(true);

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
      setIsMixed(analysis.mixed);
      setTextTone(selectTextTone(surface, analysis));
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
      data-text-tone={textTone}
      className={cn('relative z-10', className)}
      style={getContrastStyle(textTone, isMixed)}
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
  const backdrop = elements.find(
    (element) =>
      element instanceof HTMLElement &&
      !target.contains(element) &&
      !element.contains(target)
  );

  if (!(backdrop instanceof HTMLElement)) {
    return { luminance: null, media: false };
  }

  let element: HTMLElement | null = backdrop;
  let depth = 0;

  while (element && depth < 8) {
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

    element = element.parentElement;
    depth += 1;
  }

  return { luminance: null, media: false };
}

function selectTextTone(
  surface: HTMLElement | null,
  analysis: BackdropAnalysis
): TextTone {
  if (!surface) {
    return analysis.averageLuminance >= 0.46 ? 'dark' : 'light';
  }

  const surfaceColor = parseRgb(getComputedStyle(surface).backgroundColor);
  if (!surfaceColor) {
    return analysis.averageLuminance >= 0.46 ? 'dark' : 'light';
  }

  const surfaceLuminance = relativeLuminance(
    surfaceColor.red,
    surfaceColor.green,
    surfaceColor.blue
  );
  const effectiveLuminance =
    surfaceLuminance * surfaceColor.alpha +
    analysis.averageLuminance * (1 - surfaceColor.alpha);

  const darkContrast = contrastRatio(effectiveLuminance, 0.009);
  const lightContrast = contrastRatio(effectiveLuminance, 0.905);

  return lightContrast > darkContrast ? 'light' : 'dark';
}

function getContrastStyle(
  textTone: TextTone,
  mixed: boolean
): CSSProperties {
  if (textTone === 'dark') {
    return {
      color: DARK_TEXT,
      filter: mixed
        ? 'drop-shadow(0 1.5px 2.6px rgba(255,255,255,0.46))'
        : undefined,
    };
  }

  return {
    color: LIGHT_TEXT,
    filter: mixed
      ? 'drop-shadow(0 1.5px 2.6px rgba(0,0,0,0.46))'
      : undefined,
  };
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

function contrastRatio(first: number, second: number) {
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
