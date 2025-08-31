export const TILE_SIZE = 32;

export function worldToTile(x: number, y: number): { tx: number; ty: number } {
  return { tx: Math.floor(x / TILE_SIZE), ty: Math.floor(y / TILE_SIZE) };
}

export function tileToWorld(tx: number, ty: number): { x: number; y: number } {
  return { x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2 };
}

export function aabbToTiles(
  x: number,
  y: number,
  w: number,
  h: number
): { tx: number; ty: number }[] {
  const tiles: { tx: number; ty: number }[] = [];
  const left = Math.floor((x - w / 2) / TILE_SIZE);
  const right = Math.floor((x + w / 2) / TILE_SIZE);
  const top = Math.floor((y - h / 2) / TILE_SIZE);
  const bottom = Math.floor((y + h / 2) / TILE_SIZE);
  for (let ty = top; ty <= bottom; ty++) {
    for (let tx = left; tx <= right; tx++) {
      tiles.push({ tx, ty });
    }
  }
  return tiles;
}
