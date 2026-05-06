'use client';
import { useEffect } from 'react';

import fluidCursor from '@/hooks/use-FluidCursor';

const FluidCursor = () => {
  useEffect(() => {
    fluidCursor();
  }, []);

  return (
    <div className="pointer-events-none fixed top-0 left-0 z-0">
      <canvas id="fluid" className="pointer-events-none h-screen w-screen" />
    </div>
  );
};
export default FluidCursor;
