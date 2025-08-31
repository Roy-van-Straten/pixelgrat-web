# Pixelgrat Development Microtasks

This document breaks down the todo list into small, actionable steps for secure, step-by-step implementation.

## Priority Board
- HIGH: Mobile Compatibility — implement before other Phase 2+ work. See "Phase 1.5 – Mobile Compatibility" below.

---

## Phase 0 – Repo Setup
### Steps
1. ✅ Initialize Node.js project
2. ✅ Install Vite as dev dependency
3. ✅ Install Phaser 3
4. ✅ Install ESLint, Prettier, and related plugins
5. ✅ Install Jest, ts-jest, @types/jest
6. ✅ Create folder structure:
    - ✅ /src/scenes
    - ✅ /src/systems
    - ✅ /src/entities
    - ✅ /src/assets
    - ✅ /src/ui
    - ✅ /src/messaging
    - ✅ /src/persistence
    - ✅ /server
    - ✅ /tests
7. ✅ Add vite.config.ts
8. ✅ Add tsconfig.json
9. ✅ Add .eslintrc.cjs
10. ✅ Add .prettierrc
11. ✅ Create README.md stub
12. Mobile optimization: include viewport meta with viewport-fit, safe-area CSS, disable default gestures (touch-action), and plan device test matrix.

---

## Phase 1 – Game Bootstrap
### Steps
1. ✅ Create index.html with Phaser canvas
2. ✅ Initialize Phaser GameConfig in main.ts
3. ✅ Create BootScene
4. ✅ Create PreloadScene
5. ✅ Load placeholder tiles, player sprite, font, UI assets
6. ✅ Display loading progress bar
7. ✅ Add MainMenuScene
8. ✅ Add buttons: New Game, Continue, Sandbox
9. ✅ Add medieval pixel art background
10. ✅ Implement Player entity (sprite, idle/walk animation)
11. ✅ Implement topdown movement (WASD + arrow keys)
12. ✅ Camera follows player
13. ✅ Clamp camera to map bounds
14. ✅ Collision with walls, obstacles, interactables
15. Mobile optimization: verify Boot/Preload/MainMenu/Play scenes scale with FIT + autoCenter; ensure touch input enabled and pointer events do not scroll/zoom.
---

## Phase 1.5 – Mobile Compatibility [HIGH PRIORITY]
### Steps
1. ✅ Responsive layout: ensure game canvas and UI scale for mobile screens (portrait/landscape).
2. ✅ Touch controls: add on-screen joystick/buttons for movement, actions, inventory.
3. ✅ Mobile-friendly menus: increase button size, spacing, and font for touch usability.
4. Test and fix: verify on iOS/Android browsers; address any input or layout bugs.
5. Optimize performance: reduce asset sizes, tune effects for mobile hardware.
6. ✅ Add mobile detection: auto-switch controls/UI when touch device detected.
7. Document mobile support in README and add screenshots.
8. ✅ Mobile optimization: adapt controls per orientation (portrait/landscape), ensure safe-area margins (notch), provide left-handed layout toggle, and support pinch-to-zoom with clamped limits.

## Phase 2 – Core Systems
### Steps
1. ✅ Create `systems/tilemap/Grid.ts`: tile size constant, world-to-tile helpers, AABB → tiles.
2. ✅ Create `systems/dungeon/types.ts`: Room, Corridor, Door, Trap, Secret types; `DungeonConfig`.
3. ✅ Create `systems/dungeon/PRNG.ts`: seedable RNG (Mulberry32) with `seed` param.
4. Create `systems/dungeon/Generator.ts`: generate rooms (random rects), connect corridors (MST), place start/boss rooms.
5. Add door placement: locked door before boss; key placement in non-dead-end room.
6. ✅ Convert generator output → render data: floor/wall tiles, door tiles, spawn points.
7. Scene transitions scaffold: add `scenes/HubScene.ts` stub; from MainMenu → Hub → Dungeon.
8. ✅ Collision mapping: mark wall tiles as collidable; create physics static bodies from tiles.
9. Trap system base: `systems/traps/index.ts` with enum (Spike, Gas, Plate), common interface (activate, tick, render).
10. Implement Spike trap: periodic pop-up damage; render as animated tile.
11. Implement Gas trap: area hazard with DoT; render puffs; configurable radius.
12. Implement Pressure Plate: on-enter callback to open door / spawn enemies.
13. Secret system: hidden room marker; destructible wall tile that swaps to floor on hit.
14. Camera zoom: add +/- keys to tween zoom between 0.75–2.0; persist last zoom in memory.
15. Debug overlay: toggle (F1) to show seed, FPS, player coords, room bounds, door/secret markers.
16. Input mapping constants: centralize keys in `systems/input/keys.ts`.
17. Error boundaries: safe-guard for missing assets/scenes with console warning, no crash.
18. Mobile optimization: adhere to mobile budgets (tiles/particles capped), avoid heavy per-frame allocations, and keep debug overlay optional/toggleable.

---

## Phase 3 – Player & Inventory
### Steps
1. Define `types/Stats.ts`: hp, atk, def, spd, crit, resistances (phys, fire, poison).
2. Define `types/PlayerState.ts`: appearance, class, stats, level, equipment, inventory, quickbar, gold.
3. Create `ui/CharacterCreationScene.ts`: pick skin/hair/eyes/shirt/pants colors; pick class (Knight/Paladin/Ranger/Rogue/Mage).
4. Persist creation result to a `PlayerState` singleton (`systems/state/playerState.ts`).
5. Implement `data/items.ts`: seed resources, weapons, armor, food, keys, bombs with rarity and effects.
6. Create `systems/inventory/inventory.ts`: add/remove/move/stack, capacity checks, quickbar assign.
7. Create `systems/inventory/equipment.ts`: equip/unequip slots; recompute derived stats from gear.
8. Inventory UI panel `ui/InventoryUI.ts`: grid display, drag & drop, stack counts, equip highlights.
9. Item tooltips `ui/ItemTooltip.ts`: show name, rarity color, stats, effects, flavor.
10. Quick access bar `ui/Quickbar.ts`: slots 1–4; number keys to use items.
11. Hook Player to equipment: update move speed/defense when gear changes.
12. Sandbox: spawn basic items via debug button to test inventory/equip.
13. Minimal save/load tie-in: persist `PlayerState` on scene switch (using Phase 5 storage API once ready).
14. Mobile optimization: ensure inventory/equipment UI is touch-friendly (bigger hit targets, drag thresholds) and supports portrait/landscape layouts.

---

## Phase 4 – Dungeon & Battles
### Steps
1. Create `scenes/DungeonScene.ts`: consume `Generator` to build a dungeon; spawn player at entrance.
2. Place interactive props: chests (loot table), doors (locked/unlocked), switches, destructibles.
3. Implement loot tables `data/loot.ts`: common/rare/legendary with weights; drop from chests/enemies.
4. Fog-of-war: `systems/fog/Fog.ts` using RenderTexture mask; reveal radius; update on move.
5. Key/door flow: ensure a key spawns; door to boss requires key; UI prompt when near.
6. Enemy base entity `entities/Enemy.ts`: stats, hitbox, damage handling, knockback on hit.
7. Enemy AI behaviors `systems/ai/basic.ts`: patrol (waypoints), sight cone, hearing radius, chase & search.
8. Combat (real-time MVP):
    - 8.1. Melee swing for player with short arc hitbox and cooldown.
    - 8.2. Ranged projectile (arrow) with speed, lifetime, pierce flag.
    - 8.3. Damage calc: dmg = atk + weaponBonus - (def + armorBonus), clamp min 1; critical chance.
    - 8.4. On-hit feedback: flash, small knockback, damage numbers (optional).
9. Boss room: larger room selection; lock until boss defeated; health bar at top.
10. Boss mechanics (MVP): two-phase pattern, telegraphed attacks, periodic minion spawns.
11. Combat log panel `ui/CombatLog.ts`: append short events (hits, crits, status).
12. Victory: drop chest + exit portal; Defeat: respawn at Hub with item durability loss (placeholder).
13. Transition: return to `HubScene` after clear; summary screen (time, loot, secrets found).
14. Optional turn-based stub: create `scenes/BattleScene.ts` with initiative order and Attack/Defend/Item/Flee.
15. Mobile optimization: tune enemy counts/effects for mobile, add on-screen action/interact mappings, and keep combat readable at portrait zoom.

---

## Phase 5 – Persistence & API
### Steps
1. Define `types/SaveGame.ts`: versioned schema (v: number), player, hub state, unlocked dungeons, settings.
2. Create `persistence/storage.ts`: get/set/remove, namespaced keys, JSON parse/serialize with try/catch.
3. Save slots: `persistence/slots.ts` to list/create/delete/load slots; default slot id.
4. Auto-save on: scene change, inventory change, dungeon clear; debounce writes.
5. Manual save/load UI: simple buttons in Hub menu; toast confirmation.
6. Server stubs in `/server`: define REST shapes (save, load, list). No network yet—return mock data.
7. API client `systems/api/client.ts`: fetch wrappers with timeout, retry, and abort controller (future use).
8. Wire Phase 3/4 systems to call storage API at appropriate points.
9. Mobile optimization: perform saves in background (debounced), avoid blocking UI; show non-intrusive toasts sized for touch.

---

## Phase 6 – iFrame Integration
### Steps
1. Create `messaging/bridge.ts`: typed postMessage helpers, origin allowlist, handlers map.
2. Define message contracts `messaging/messages.ts`: PG_INIT, PG_SAVE_REQUEST, PG_LOAD_RESULT, PG_EVENT, PG_DUNGEON_COMPLETE, PG_ACHIEVEMENT_UNLOCKED.
3. Init handshake: parent → game (PG_INIT), game → parent ack with version & ready.
4. Save flow: parent sends PG_SAVE_REQUEST; game persists and responds with PG_EVENT(status: ok).
5. Load flow: parent sends PG_LOAD_REQUEST; game responds PG_LOAD_RESULT with SaveGame payload.
6. Event emitters: game posts PG_EVENT on key milestones (dungeon_clear, level_up, achievement).
7. Create `examples/parent-iframe-demo/index.html`: iframe embed, message console, send buttons.
8. Security: ignore messages from unknown origins; include source validation in bridge.
9. Mobile optimization: ensure iframe embeds propagate viewport/meta correctly and that touch input isn’t intercepted by parent page.

---

## Phase 7 – Testing & Quality
### Steps
1. Configure Jest + ts-jest: add `jest.config.cjs`; add `npm test` script.
2. Inventory tests: add/remove/move/stack; equip stat recompute.
3. Dungeon generator tests: rooms not overlapping, full connectivity, boss door requires key.
4. Movement/collision tests: player velocity normalization; wall collision blocks movement.
5. Trap tests: spike timing deals damage; gas DoT applies over time; plate triggers callback once.
6. Combat math tests: damage clamp >=1; crit doubles damage; armor mitigation works.
7. Messaging tests: validate message shapes and handshake flow.
8. CI: add `.github/workflows/ci.yml` (lint → test → build), cache node_modules.
9. Docs: update README with architecture, systems overview, messaging API, and run instructions.
10. Mobile optimization: add device smoke tests (portrait/landscape), FPS budget checks, and a manual test checklist.

---

## Phase 8 – Polish & Debug
### Steps
1. HUD basics `ui/HUD.ts`: health bar/hearts, coins, equipped weapon, floor indicator.
2. Minimap `ui/Minimap.ts`: low-res dungeon map; reveal based on fog; player blip.
3. Sandbox panel `ui/SandboxPanel.ts`: buttons to spawn items/enemies, reveal map, teleport, toggle godmode.
4. Error UX: fallback sprites for missing assets; non-blocking toasts on errors.
5. Sound system `systems/audio/index.ts`: load SFX; play on pickup/combat/trap; master mute toggle.
6. UI polish: consistent pixel-font, hover states, button sounds, screen transitions (fade from/to black).
7. Performance pass: cap particle counts; throttle fog updates; pool projectiles.
8. Visualize dungeon debug: draw room/corridor overlays and trap/enemy markers with F1 toggle.
9. Mobile optimization: add adaptive HUD for portrait vs. landscape, ensure controls never overlap HUD, and provide left-handed layout option.
---
