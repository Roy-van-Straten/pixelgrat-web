Phase 0 – Repo Setup
    • Initialize Node.js project (npm init -y).
    • Install dev dependencies:
        ○ Vite (npm install --save-dev vite)
        ○ Phaser 3 (npm install phaser)
        ○ ESLint + Prettier (npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier)
        ○ Jest (npm install --save-dev jest ts-jest @types/jest)
    • Create initial folder structure:

/src
  /scenes       # game scenes (hub, dungeon, battle, menu)
  /systems      # core mechanics (movement, combat, inventory, dungeon generation, traps)
  /entities     # player, NPCs, enemies, bosses
  /assets       # images, tilesets, audio, animations
  /ui           # menus, HUDs, minimap, inventory, skill tree
  /messaging    # postMessage interface for iframe
  /persistence  # save/load abstraction
/server         # placeholder for API
/tests          # unit/integration tests
    • Add vite.config.ts (Phaser canvas, pixel art settings).
    • Add tsconfig.json (TypeScript config).
    • Add .eslintrc.cjs + .prettierrc (lint & formatting rules).
    • Create README.md stub (project overview, setup, folder structure).

Phase 1 – Game Bootstrap
    • Create index.html with Phaser canvas placeholder.
    • Initialize Phaser GameConfig in main.ts (canvas size, scale mode, pixelArt: true).
    • Create BootScene and PreloadScene:
        ○ Load placeholder tiles, player sprite, font, UI assets.
        ○ Display loading progress bar and tips.
    • Add MainMenuScene:
        ○ Buttons: New Game, Continue, Sandbox (no functionality yet).
        ○ Medieval pixel art background, animated logo.
    • Implement Player entity:
        ○ Placeholder sprite, basic idle/walk animation.
        ○ Topdown movement (WASD + arrow keys), diagonal movement.
        ○ Camera follows player, clamps to map bounds.
        ○ Collision with walls, obstacles, interactable objects.

Phase 2 – Systems
    • Tilemap system: grid map for hub, dungeon entrance, procedural dungeon floors.
    • Dungeon generation: random rooms, corridors, traps, secrets, locked doors, destructible walls.
    • Scene transitions: menu → hub → dungeon → battle → victory/defeat.
    • Collision system: walls, obstacles, traps, interactables, player movement limits.
    • Trap system: spikes, poison gas, pressure plates, timed hazards.
    • Camera system: follows player smoothly, clamps to map bounds, supports zoom.
    • Debug utilities: show player coordinates, FPS counter, dungeon seed (optional).

Phase 3 – Player & Inventory
    • Stub Character Creation UI: choose skin, hair, eyes, shirt/pants color, class selection.
    • Define PlayerState TypeScript interface (appearance, stats, inventory, skills, class).
    • Implement Inventory system (sandbox mode):
        ○ Add/remove items, drag & drop, stackable items.
        ○ Equip weapon/armor, show stat changes.
        ○ Show inventory UI panel, quick access bar.
        ○ Item tooltips: stats, rarity, effects.
    • Seed basic items (resources, weapons, armor, food, keys, bombs) in src/data/items.ts.

Phase 4 – Dungeon & Turn-Based Battles
    • Implement DungeonScene:
        ○ Procedural topdown map with multiple rooms, traps, secrets, loot chests, battle triggers.
        ○ Fog-of-war reveals map as player explores.
        ○ Boss room with locked entrance, key found in dungeon.
    • Implement BattleScene (turn-based or real-time, topdown):
        ○ Actions: Attack, Defend, Use Item, Flee, Special Ability.
        ○ Turn order by speed stat (if turn-based).
        ○ Damage formula: (atk + weaponBonus) - (def + armorBonus), critical hits, elemental effects.
        ○ Log combat events to panel, show animations.
    • Add Enemy entity: stats, sprite, AI behaviors (patrol, chase, ambush), boss mechanics (phases, minion summons).
    • Return to HubScene after battle or dungeon completion.

Phase 5 – Persistence & API Integration
    • Create SaveGame interface for player state, inventory, dungeon progress, achievements.
    • Implement persistence/storage.ts using localStorage (auto-save, manual save/load).
    • Stub server folder for API calls (future: save/load to Postgres or MongoDB, leaderboard, achievements).
    • Connect frontend fetch requests to server API endpoints (save/load, user profile).

Phase 6 – iFrame Integration
    • Implement messaging/bridge.ts with window.postMessage listeners.
    • Define messages: PG_INIT, PG_SAVE_REQUEST, PG_LOAD_RESULT, PG_EVENT, PG_DUNGEON_COMPLETE, PG_ACHIEVEMENT_UNLOCKED.
    • Create examples/parent-iframe-demo page to:
        ○ Embed the game in an iframe.
        ○ Send user info + saveId, receive game state updates.
        ○ Display achievements, dungeon completion status.

Phase 7 – Testing & Quality
    • Add unit/integration tests (Jest or Vitest) for:
        ○ Inventory functions, item stacking, equip/unequip logic.
        ○ Player movement, collision, trap interaction.
        ○ Dungeon generation: room connectivity, secret placement, trap logic.
        ○ Enemy AI: patrol, chase, combat.
        ○ Turn order & battle math, boss mechanics.
        ○ Messaging protocol validation, save/load.
    • Add CI (GitHub Actions) for lint → test → build, code coverage.
    • Add documentation for folder structure, systems, dungeon generation, combat, and messaging API.

Phase 8 – Polish & Debug
    • Add placeholder HUD: health, coins, equipped weapon, minimap, dungeon floor indicator.
    • Add sandbox debug buttons: spawn items, spawn enemies, reveal map, teleport to room.
    • Ensure scene transitions don’t break on missing assets, handle errors gracefully.
    • Minimal sound support: toggle mute, play sound on item pickup, combat, trap trigger.
    • Polish UI: pixel art icons, tooltips, smooth transitions, achievement popups.
    • Debug dungeon generation: visualize room layout, trap placement, enemy spawns.
