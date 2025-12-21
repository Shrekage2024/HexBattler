export type Axial = { q: number; r: number };

export const axialKey = (a: Axial): string => `${a.q},${a.r}`;

export const buildHexes = (radius: number): Axial[] => {
  const hexes: Axial[] = [];
  for (let q = -radius; q <= radius; q += 1) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r += 1) {
      hexes.push({ q, r });
    }
  }
  return hexes;
};

export const buildHexMap = (hexes: Axial[]): Map<string, Axial> => {
  const map = new Map<string, Axial>();
  hexes.forEach((hex) => {
    map.set(axialKey(hex), hex);
  });
  return map;
};

export const axialToPixel = (a: Axial, size: number) => {
  const x = size * Math.sqrt(3) * (a.q + a.r / 2);
  const y = size * (3 / 2) * a.r;
  return { x, y };
};

export const hexPolygonPoints = (size: number): string => {
  const points: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    const px = size * Math.cos(angle);
    const py = size * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  return points.join(' ');
};

export const boardViewBox = (radius: number, size: number, padding: number): string => {
  const hexes = buildHexes(radius);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  hexes.forEach((hex) => {
    const { x, y } = axialToPixel(hex, size);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });

  minX -= size + padding;
  maxX += size + padding;
  minY -= size + padding;
  maxY += size + padding;

  const width = maxX - minX;
  const height = maxY - minY;
  return `${minX} ${minY} ${width} ${height}`;
};

export const makeHexagonDisk = (radius: number) => buildHexes(radius);
