export type Axial = { q: number; r: number };
export type HexKey = string;

export const axialKey = (a: Axial): HexKey => `${a.q},${a.r}`;

export const neighborOffsets: Axial[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];
