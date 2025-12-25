import type { Axial, HexKey } from '@/domain/hex';
import { axialKey, neighborOffsets } from '@/domain/hex';

export interface Preview {
  highlighted: Set<HexKey>;
  arrows?: Array<{ from: Axial; to: Axial }>;
}

export interface PreviewEngine {
  getPreview: (context: { selectedHex?: Axial | null; selectedFrameIndex?: number | null }) => Preview;
}

export const createPreviewEngine = (): PreviewEngine => ({
  getPreview: ({ selectedHex, selectedFrameIndex }) => {
    if (!selectedHex) return { highlighted: new Set() };
    if (selectedFrameIndex === null || selectedFrameIndex === undefined) {
      return { highlighted: new Set() };
    }
    const highlighted = new Set<HexKey>();
    neighborOffsets.forEach((offset) => {
      highlighted.add(
        axialKey({
          q: selectedHex.q + offset.q,
          r: selectedHex.r + offset.r,
        })
      );
    });
    return { highlighted };
  },
});
