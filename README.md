# Pixelgrat Web

A top-down medieval dungeon crawler built with Phaser 3 and Vite.

## Setup

1. `npm install`
2. `npm run dev`

## Folder Structure

- `/src/scenes` — Game scenes (hub, dungeon, battle, menu)
- `/src/systems` — Core mechanics (movement, combat, inventory, dungeon generation, traps)
- `/src/entities` — Player, NPCs, enemies, bosses
- `/src/assets` — Images, tilesets, audio, animations
- `/src/ui` — Menus, HUDs, minimap, inventory, skill tree
- `/src/messaging` — postMessage interface for iframe
- `/src/persistence` — Save/load abstraction
- `/server` — Placeholder for API
- `/tests` — Unit/integration tests

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm test` — Run tests
