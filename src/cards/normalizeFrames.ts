import type { Frame } from './types';

export const normalizeFrames = (frames: Frame[]): Frame[] => {
  const ordered = [...frames].sort((a, b) => a.index - b.index);

  if (import.meta.env.DEV) {
    const seen = new Set<number>();
    ordered.forEach((frame) => {
      if (seen.has(frame.index)) {
        console.warn(`[CardDemo] Duplicate frame index detected: ${frame.index}`);
      }
      seen.add(frame.index);
    });
  }

  return ordered;
};
