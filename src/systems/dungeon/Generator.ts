import { PRNG } from './PRNG';
import { DungeonConfig, Room, Corridor, Door } from './types';

export type Dungeon = {
  rooms: Room[];
  corridors: Corridor[];
  doors: Door[];
};

export function generateDungeon(cfg: DungeonConfig): Dungeon {
  const seed = typeof cfg.seed === 'string' ? hashString(cfg.seed) : cfg.seed;
  const rng = new PRNG(seed);
  const rooms: Room[] = [];

  const roomCount = rng.int(cfg.rooms.min, cfg.rooms.max);
  for (let i = 0; i < roomCount; i++) {
    const w = rng.int(cfg.rooms.size.min, cfg.rooms.size.max);
    const h = rng.int(cfg.rooms.size.min, cfg.rooms.size.max);
    const x = rng.int(0, 100 - w);
    const y = rng.int(0, 100 - h);
    rooms.push({ x, y, w, h });
  }

  // naive corridors linking rooms in sequence
  const corridors: Corridor[] = [];
  for (let i = 1; i < rooms.length; i++) {
    const a = rooms[i - 1];
    const b = rooms[i];
    corridors.push({ x1: a.x + (a.w >> 1), y1: a.y + (a.h >> 1), x2: b.x + (b.w >> 1), y2: b.y + (b.h >> 1) });
  }

  // place a single locked door before the last room as a stub
  const doors: Door[] = rooms.length > 1 ? [{ x: rooms[rooms.length - 2].x, y: rooms[rooms.length - 2].y, locked: true }] : [];

  return { rooms, corridors, doors };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}
