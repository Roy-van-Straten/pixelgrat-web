export type Room = { x: number; y: number; w: number; h: number };
export type Corridor = { x1: number; y1: number; x2: number; y2: number };
export type Door = { x: number; y: number; locked?: boolean };
export enum TrapType { Spike = 'Spike', Gas = 'Gas', Plate = 'Plate' }
export type Trap = { type: TrapType; x: number; y: number };
export type Secret = { x: number; y: number };

export type DungeonConfig = {
  seed: number | string;
  rooms: { min: number; max: number; size: { min: number; max: number } };
};
