'use client';

import { useEffect } from 'react';

export function CodeCopyEnhancer() {
  useEffect(() => {
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.blog-code-copy')
    );

    const cleanups = buttons.map((button) => {
      const handleClick = async () => {
        const figure = button.closest('.blog-code-figure');
        const code = figure?.querySelector('pre')?.textContent ?? '';

        if (!code) return;

        try {
          await navigator.clipboard.writeText(code.trimEnd());
          button.textContent = 'Copied';
          window.setTimeout(() => {
            button.textContent = 'Copy';
          }, 1600);
        } catch {
          button.textContent = 'Failed';
          window.setTimeout(() => {
            button.textContent = 'Copy';
          }, 1600);
        }
      };

      button.addEventListener('click', handleClick);
      return () => button.removeEventListener('click', handleClick);
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
