
Overview
Pixelgrat is a pixelated top-down medieval dungeon crawler RPG, emphasizing player creativity, freedom, and replayability. Set in the Middle Ages of a distant planet, the world is filled with competitive races and creatures, each presenting unique challenges. Players delve into procedurally generated dungeons, solve environmental puzzles, battle enemies, and develop their characters through a robust progression system. The game’s core loop centers on exploration, combat, loot acquisition, and character growth, with a focus on atmospheric dungeon environments and strategic gameplay.

Core Features
    1. Top-Down Dungeon Exploration
        ○ Procedurally generated dungeons with multiple floors, secret rooms, traps, and environmental hazards (spikes, poison gas, collapsing floors).
        ○ Fog-of-war system reveals the map as players explore.
        ○ Interactable objects: levers, pressure plates, locked doors, destructible walls, hidden passages.
        ○ Checkpoints and safe rooms for saving progress and managing inventory.
    2. Dungeon Missions & Objectives
        ○ Missions focus on dungeon crawling: defeat bosses, rescue NPCs, retrieve artifacts, solve puzzles.
        ○ Each dungeon features unique layouts, enemy types, and environmental challenges.
        ○ Optional objectives: find all secrets, complete under time limit, no damage runs.
        ○ Completing dungeons rewards rare loot, skill points, and unlocks new areas.
    3. Combat Systems
        ○ Real-Time, Skill-Based Combat
            § Players move, attack, dodge, and use abilities in real time.
            § Weapon types: swords, axes, bows, spears, magic staves—each with unique attack patterns and combos.
            § Armor and shields provide damage reduction and special effects (reflect, elemental resistances).
            § Enemy AI: patrols, ambushes, group tactics, boss mechanics (phases, telegraphed attacks, minion summons).
            § Environmental combat: use traps, hazards, and destructible objects to gain advantage.
        ○ Weapon & Armor Upgrades
            § Collect materials to upgrade gear, unlock new abilities, and customize playstyle.
    4. Character Creation & Customization
        ○ Detailed avatar design: skin, hair, eye color, clothing (shirt, pants, shoes, armor pieces).
        ○ Customization impacts visual identity and minor gameplay stats (speed, stealth, defense).
        ○ Unlock cosmetic items and skins through achievements and dungeon milestones.
    5. Warrior Classes & Synergy
        ○ Choose a class at the start, each with unique skill trees and playstyles:
            § Knight: Heavy armor, shield block, melee combos, taunt.
            § Paladin: Melee/magic hybrid, healing, buffs, holy damage.
            § Ranger: Ranged attacks, traps, stealth, mobility.
            § Rogue: High speed, critical hits, evasion, poison.
            § Mage: Elemental spells, area damage, crowd control, low defense.
        ○ Class synergy: unlock team-based abilities for multiplayer (e.g., combo attacks, shared buffs).
    6. Skills, Progression & Loot
        ○ Deep skill trees: unlock active abilities, passive bonuses, and class-specific perks.
        ○ Leveling up grants access to advanced dungeons, equipment, and cosmetic upgrades.
        ○ Loot system: common, rare, legendary items with randomized stats and effects.
        ○ Skill synergy: combine abilities for unique effects (e.g., fire trap + wind spell = firestorm).
    7. Home Base & Player Hub
        ○ Personal hub for storing, upgrading, and displaying items, weapons, and armor.
        ○ Training rooms: test weapons, fight AI dummies, practice combos.
        ○ Storage chests: organize inventory, manage loot, upgrade slots.
        ○ Trophy room: showcase achievements, rare loot, boss trophies.
    8. Inventory & Resource System
        ○ Materials: Wood, Stone, Iron, Copper, Silver, Gold, Leather, rare dungeon resources (crystals, runes).
        ○ Weapons: Bow, Arrows, Dagger, Sword, Axe, Spear, magic staves, traps.
        ○ Armor & Clothing: Equipable items with stat boosts, elemental resistances, set bonuses.
        ○ Consumables: food, potions, scrolls, keys, bombs.
        ○ Inventory management: limited slots, upgradeable backpacks, auto-sort, quick access bar.
        ○ Sandbox mode: unlimited supply for creative freedom and testing.

Dungeon & Mission System
    • Dungeons: procedurally generated layouts, multiple floors, secret rooms, environmental hazards, and dynamic enemy spawns.
    • Boss encounters: multi-phase fights, unique mechanics, puzzle elements.
    • Enemy scaling: difficulty adapts to player progress and party size.
    • Cooperative multiplayer: team up to tackle harder dungeons, unlock combo abilities.
    • Rewards: equipment, resources, skill points, rare artifacts, cosmetic trophies.

MVP (v0.1)
The first version of Pixelgrat will focus on core dungeon crawling and replayability:
    • Procedurally generated dungeons with traps, secrets, and boss rooms.
    • Real-time combat with basic enemy AI and weapon variety.
    • Fully functional inventory, loot, and upgrade systems.
    • Personal hub for storage, training, and achievement display.
    • Sandbox mode for unlimited resources and creative experimentation.
    • Core systems ready for expansion to advanced dungeons, multiplayer, and quest content.

Story & Setting
Prologue
    “The dungeon does not forgive. It swallows the weak, buries the lost, and turns legends into dust.”
    Two survivors, a master and apprentice, journeyed to find the Holy Temple, a relic of forgotten gods. One by one, their companions fell to the depths. Now only the apprentice remains, tasked with completing the mission. With the master’s relic and book in hand, the apprentice faces a portal into the unknown — the gateway to the next adventure.
World Setting
    • Medieval alien world: competitive wildlife, diverse races, and dangerous terrains.
    • Dungeon and city concepts (Chiang Mai inspired):
        ○ Mushroomshop, Gun Cha Shop, Roti Shop, 3 Kings monument Skating, Inchala Tea Shop, X-Lab, Muay Thai Stadium, Kalare Night Bazaar, Elephant Feeding Area, Graffiti Shop
        ○ Gates: East, West, North, South

Art & Design
    • Pixelated, immersive medieval dungeon aesthetic.
    • Color palettes for objects, materials, and interactive elements:
        ○ Wood planks: #986B41
        ○ Shadows & cracks: #795533 / #767400 / #5E5D01
        ○ Keyhole: #242424
        ○ Doorknob: #3F3F3F / #727272
    • Objects: chests (normal/rare/legendary, small/big), fences, gates, signs, workbench, traps, torches, animated doors, environmental storytelling props.
    • UI: pixel art inventory, skill tree, minimap, health/stamina bars, loot popups.
    • Animation: attack combos, spell effects, enemy behaviors, environmental interactions.

Data & Local Models
    • Player profile:
        ○ Username: visible to NPCs and players.
        ○ Character: inventory slots (primary, secondary, backpack), clothing, skill tree, achievement log.
        ○ Level: unlocks new dungeons, areas, and game modes.
    • Character slots:
        ○ Primary: weapon/tool
        ○ Secondary: shield/second weapon
        ○ Tertiary: backpack
        ○ Clothing: head, body, legs, feet
        ○ Inventory: array of slots (expandable 4–20 depending on backpack)
        ○ Quick access bar: assign consumables, traps, spells for fast use.

Technical Notes
    • Designed for HTML/Phaser web implementation, optimized for top-down dungeon crawling.
    • Can be embedded in iframe within main website.
    • Backend prepared for shared database with future Unity/Godot clients.
    • Sandbox-first MVP ensures all systems are testable before full dungeon/quest implementation.
    • Modular architecture for easy expansion: new dungeon types, enemy behaviors, multiplayer features.

This version of the document gives you a clear, cohesive “game bible”: lore, core mechanics, classes, combat, progression, inventory, environment, and MVP scope—now enhanced for a top-down medieval dungeon crawler experience.
