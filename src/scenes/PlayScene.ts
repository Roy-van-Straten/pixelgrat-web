import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { TILE_SIZE, tileToWorld } from '../systems/tilemap/Grid';
import { generateDungeon } from '../systems/dungeon/Generator';
import type { Room } from '../systems/dungeon/types';

export class PlayScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private zoomPlus?: Phaser.Input.Keyboard.Key;
  private zoomMinus?: Phaser.Input.Keyboard.Key;
  private bg?: Phaser.GameObjects.TileSprite;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private interactables!: Phaser.Physics.Arcade.StaticGroup;
  private dungeonRT?: Phaser.GameObjects.RenderTexture;
  private dungeonCols = 120;
  private dungeonRows = 120;
  private startRoom?: Room;
  // Mobile controls
  private joystickBase?: Phaser.GameObjects.Arc;
  private joystickThumb?: Phaser.GameObjects.Arc;
  private joystickPointerId: number | null = null;
  private joyVector = new Phaser.Math.Vector2(0, 0);
  private actionButton?: Phaser.GameObjects.Arc; // sprint/attack placeholder
  private actionPressed = false;
  private interactButton?: Phaser.GameObjects.Arc; // interact placeholder
  private interactPressed = false;
  private padBaseFrac = 0.12;
  private leftHanded = false;
  private pinchStartDist: number | null = null;
  private pinchStartZoom = 1;
  private activeTouches = new Map<number, Phaser.Input.Pointer>();
  private controlsVisible = true;
  private actionLabel?: Phaser.GameObjects.Text;
  private interactLabel?: Phaser.GameObjects.Text;
  private baseRadiusFor(width: number, height: number) {
    const frac = this.isPortrait() ? 0.14 : 0.12;
    return Math.max(56, Math.min(width, height) * frac);
  }
  private isPortrait(): boolean {
    const cam = this.cameras?.main;
    if (!cam) return false;
    return cam.height >= cam.width;
  }
  private joystickDefaultX?: number;
  private joystickDefaultY?: number;
  private joystickWasRepositioned = false;

  constructor() {
    super('PlayScene');
  }

  create() {
  const { width, height } = this.cameras.main;
  // handedness from query param; toggle with 'H' on desktop
  const params = new URLSearchParams(window.location.search);
  this.leftHanded = ['1', 'true', 'yes'].includes((params.get('left') || '').toLowerCase());

    // simple procedural tiled background
    const tile = 8;
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x2f3e2e, 1);
    g.fillRect(0, 0, tile, tile);
    g.fillStyle(0x3b4c3a, 1);
    g.fillRect(0, 0, 4, 4);
    g.fillRect(4, 4, 4, 4);
    g.generateTexture('play-bg-tile', tile, tile);
    g.destroy();
  this.bg = this.add.tileSprite(0, 0, width, height, 'play-bg-tile').setOrigin(0);
  this.bg.setScrollFactor(0); // keep background anchored to camera

  // Build dungeon first to know world size
  this.buildDungeon();
  const worldWidth = this.dungeonCols * TILE_SIZE;
  const worldHeight = this.dungeonRows * TILE_SIZE;
  this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
  this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

  // create player in the center of the starting room (fallback to world center)
  const spawn = this.startRoom
    ? tileToWorld(this.startRoom.x + Math.floor(this.startRoom.w / 2), this.startRoom.y + Math.floor(this.startRoom.h / 2))
    : { x: worldWidth / 2, y: worldHeight / 2 };
  this.player = new Player(this, spawn.x, spawn.y);
  // Ensure collision with dungeon walls
  if (this.walls) {
    this.physics.add.collider(this.player, this.walls);
  }

    // input
  const keyboard = this.input.keyboard!;
  this.cursors = keyboard.createCursorKeys();
  this.wasd = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
  // desktop zoom keys (Z to zoom out, X to zoom in)
  this.zoomPlus = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  this.zoomMinus = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
  // desktop handedness toggle (H)
  const toggleHand = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
  toggleHand.on('down', () => {
    this.leftHanded = !this.leftHanded;
    // trigger a resize layout recalculation
    this.scale.emit('resize', this.scale.gameSize);
  });
  // controls visibility toggle (V)
  const toggleVis = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V);
  toggleVis.on('down', () => {
    this.controlsVisible = !this.controlsVisible;
    this.setControlsVisible(this.controlsVisible);
  });
  // camera follow with smoothing and strong initial zoom for better visibility
  const initialZoom = this.isPortrait() ? 2.7 : 2.2;
  this.cameras.main.setZoom(initialZoom);
  this.cameras.main.roundPixels = true;
  // Keep player centered without smoothing (lerp=1 for immediate follow)
  this.cameras.main.startFollow(this.player, true, 1, 1);
  // Keep player centered across orientations
  this.cameras.main.followOffset.set(0, 0);

    // Setup mobile controls if device looks touch-like or forced via URL
  if (this.shouldUseTouchControls()) {
      this.createMobileControls();
    }
    // Colliders vs dungeon walls already created in buildDungeon()
    // --- Interactables (non-blocking) ---
    // create a small chest-like tile (reusable texture)
    if (!this.textures.exists('interactable-tex')) {
      const ig = this.make.graphics({ x: 0, y: 0 });
      ig.fillStyle(0x8b5a2b, 1); // wood
      ig.fillRect(0, 0, 16, 12);
      ig.fillStyle(0x3f2a16, 1); // darker band
      ig.fillRect(0, 5, 16, 2);
      ig.generateTexture('interactable-tex', 16, 12);
      ig.destroy();
    }

    this.interactables = this.physics.add.staticGroup();
    // place a chest inside a secondary room if available
    if (this.startRoom) {
      const secondX = this.startRoom.x + this.startRoom.w + 2;
      const secondY = this.startRoom.y;
      const world = tileToWorld(secondX, secondY);
      this.interactables.create(world.x, world.y, 'interactable-tex');
    }
    this.physics.add.overlap(this.player, this.interactables, () => {
      // placeholder: show in console for now
      // eslint-disable-next-line no-console
      console.log('Interactable nearby: Press E (placeholder)');
    });
  }

  update() {
    const speed = this.actionPressed ? 165 : 120;
    let vx = 0;
    let vy = 0;

  const up = this.cursors.up?.isDown || this.wasd.up.isDown || this.joyVector.y < -0.3;
  const down = this.cursors.down?.isDown || this.wasd.down.isDown || this.joyVector.y > 0.3;
  const left = this.cursors.left?.isDown || this.wasd.left.isDown || this.joyVector.x < -0.3;
  const right = this.cursors.right?.isDown || this.wasd.right.isDown || this.joyVector.x > 0.3;

    if (up) vy -= 1;
    if (down) vy += 1;
    if (left) vx -= 1;
    if (right) vx += 1;

    // normalize diagonal
    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy);
      vx = (vx / len) * speed;
      vy = (vy / len) * speed;
    }

    this.player.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      if (vx < 0) this.player.setFlipX(true);
      if (vx > 0) this.player.setFlipX(false);
      this.player.anims.play('player-walk', true);
    } else {
      this.player.anims.play('player-idle', true);
    }

    // optional background parallax
    if (this.bg) {
      this.bg.tilePositionX += vx * 0.0015;
      this.bg.tilePositionY += vy * 0.0015;
    }

    // desktop keyboard zoom
    if (this.zoomPlus?.isDown) {
      this.cameras.main.setZoom(Phaser.Math.Clamp(this.cameras.main.zoom + 0.02, 0.8, 3.0));
    } else if (this.zoomMinus?.isDown) {
      this.cameras.main.setZoom(Phaser.Math.Clamp(this.cameras.main.zoom - 0.02, 0.8, 3.0));
    }
  }

  private shouldUseTouchControls(): boolean {
    const params = new URLSearchParams(window.location.search);
    const force = (params.get('touch') || '').toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(force)) return true;
    const block = (params.get('notouch') || '').toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(block)) return false;
    // Phaser touch flag
    if (this.sys.game.device.input.touch) return true;
    // Coarse pointer heuristic
    try {
      if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return true;
    } catch {}
    // Small screens default to showing controls
    const w = this.scale.gameSize.width;
    const h = this.scale.gameSize.height;
    return Math.min(w, h) <= 820;
  }

  private createMobileControls() {
    const { width, height } = this.cameras.main;
  const padRadius = this.baseRadiusFor(width, height);
    const thumbRadius = padRadius * 0.45;

  // virtual joystick (bottom-left or bottom-center bias in portrait)
  const jy = height - padRadius * 1.1;
  const jxLeft = this.isPortrait() ? padRadius * 1.2 : padRadius * 1.1;
  const jxRight = width - jxLeft;
  const jx = this.leftHanded ? jxRight : jxLeft;
  this.joystickBase = this.add.circle(jx, jy, padRadius, 0x000000, 0.35).setScrollFactor(0).setDepth(1000);
    this.joystickBase.setStrokeStyle(3, 0xffffff, 0.75);
    this.joystickThumb = this.add.circle(this.joystickBase.x, this.joystickBase.y, thumbRadius, 0xffffff, 0.55).setScrollFactor(0).setDepth(1001);
    this.joystickThumb.setStrokeStyle(3, 0xffffff, 1);
    this.joystickDefaultX = jx;
    this.joystickDefaultY = jy;

    // action button (bottom-right)
    const btnR = padRadius * 0.55;
  const actionX = this.leftHanded ? padRadius * 1.1 : width - padRadius * 1.1;
  this.actionButton = this.add.circle(actionX, height - padRadius * 1.2, btnR, 0xff5555, 0.6).setScrollFactor(0).setDepth(1000);
    this.actionButton.setStrokeStyle(3, 0xffffff, 0.9);
    this.actionLabel = this.add.text(this.actionButton.x, this.actionButton.y, 'A', {
      fontFamily: 'monospace', fontSize: Math.round(btnR * 0.9) + 'px', color: '#ffffff', align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

    // Input handling for joystick
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      // Track touches for pinch-to-zoom (gate on device touch support)
      if (this.sys.game.device.input.touch) {
        this.activeTouches.set(p.id, p);
        if (this.activeTouches.size === 2) {
          const pts = Array.from(this.activeTouches.values());
          this.pinchStartDist = Phaser.Math.Distance.Between(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
          this.pinchStartZoom = this.cameras.main.zoom;
        }
      }
      // If touch near joystick area, capture it for joystick. Also allow a generous left-bottom zone to start movement.
      const base = this.joystickBase;
      const nearJoy = base
        ? Phaser.Math.Distance.Between(p.x, p.y, base.x, base.y) <= (base.radius as number) * 1.25
        : false;
      const cw = this.cameras.main.width;
      const ch = this.cameras.main.height;
      const joySideFrac = this.isPortrait() ? 0.6 : 0.45;
      const inJoyZone = (this.leftHanded ? p.x > cw * (1 - joySideFrac) : p.x < cw * joySideFrac) && p.y > ch * 0.5;
      if ((nearJoy || inJoyZone) && this.joystickPointerId === null) {
        this.joystickPointerId = p.id;
        // If not near the current base, temporarily reposition base to touch for this gesture
        if (!nearJoy && base) {
          this.joystickWasRepositioned = true;
          base.setPosition(p.x, p.y);
          this.joystickThumb?.setPosition(p.x, p.y);
        }
        this.updateJoystick(p.x, p.y);
      } else {
        // treat as action button press if near button
        if (this.actionButton && Phaser.Math.Distance.Between(p.x, p.y, this.actionButton.x, this.actionButton.y) <= (this.actionButton.radius as number) * 1.3) {
          this.actionPressed = true;
          this.tintButton(true);
        } else if (this.interactButton && Phaser.Math.Distance.Between(p.x, p.y, this.interactButton.x, this.interactButton.y) <= (this.interactButton.radius as number) * 1.3) {
          this.interactPressed = true;
          this.tintInteract(true);
        }
      }
    });

  this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      // Pinch-to-zoom handling
      if (this.sys.game.device.input.touch && this.activeTouches.has(p.id)) {
        this.activeTouches.set(p.id, p);
        if (this.pinchStartDist && this.activeTouches.size >= 2) {
          const pts = Array.from(this.activeTouches.values()).slice(0, 2);
          const dist = Phaser.Math.Distance.Between(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
          const ratio = dist / (this.pinchStartDist || 1);
          const target = Phaser.Math.Clamp(this.pinchStartZoom * ratio, 0.8, 3.0);
          this.cameras.main.setZoom(target);
        }
      }
      if (p.id === this.joystickPointerId) {
        this.updateJoystick(p.x, p.y);
      }
    });

    const release = (p: Phaser.Input.Pointer) => {
      if (p.id === this.joystickPointerId) {
        this.joystickPointerId = null;
        this.resetJoystick();
        // Restore base back to default position if it was moved for this gesture
        if (this.joystickWasRepositioned && this.joystickBase && this.joystickDefaultX !== undefined && this.joystickDefaultY !== undefined) {
          this.joystickBase.setPosition(this.joystickDefaultX, this.joystickDefaultY);
          this.joystickThumb?.setPosition(this.joystickDefaultX, this.joystickDefaultY);
        }
        this.joystickWasRepositioned = false;
      }
  if (this.sys.game.device.input.touch) {
        this.activeTouches.delete(p.id);
        if (this.activeTouches.size < 2) {
          this.pinchStartDist = null;
        }
      }
  this.actionPressed = false;
  this.interactPressed = false;
  this.tintButton(false);
  this.tintInteract(false);
    };

    this.input.on('pointerup', release);
    this.input.on('pointerupoutside', release);

  // Interact button (above action)
  const btnR2 = btnR * 0.9;
  const ix = this.leftHanded
    ? (this.isPortrait() ? padRadius * 1.1 : padRadius * 0.8)
    : width - (this.isPortrait() ? padRadius * 1.1 : padRadius * 0.8);
  const iy = this.isPortrait() ? height - padRadius * 2.6 : height - padRadius * 2.1;
  this.interactButton = this.add.circle(ix, iy, btnR2, 0x55aaff, 0.6).setScrollFactor(0).setDepth(1000);
    this.interactButton.setStrokeStyle(3, 0xffffff, 0.9);
    this.interactLabel = this.add.text(ix, iy, 'E', {
      fontFamily: 'monospace', fontSize: Math.round(btnR2 * 0.9) + 'px', color: '#ffffff', align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

    // Resize handler to resize and reposition controls and background
  const onResize = (g: Phaser.Structs.Size) => {
      const w = g.width;
      const h = g.height;
      // update background size to fill view
      if (this.bg) this.bg.setSize(w, h);

      // recompute radii based on current min dimension
      const baseR = this.baseRadiusFor(w, h);
      const thumbR = baseR * 0.45;

      if (this.joystickBase && this.joystickThumb) {
        this.joystickBase.setRadius(baseR);
        const leftX = baseR * 1.1;
        const portX = baseR * 1.2;
        const defLeft = this.isPortrait() ? portX : leftX;
        const defRight = w - defLeft;
        const defX = this.leftHanded ? defRight : defLeft;
        const defY = h - baseR * 1.1;
        this.joystickDefaultX = defX;
        this.joystickDefaultY = defY;
        // Only snap to default if not currently dragging or not in a repositioned drag
        if (this.joystickPointerId === null || !this.joystickWasRepositioned) {
          this.joystickBase.setPosition(defX, defY);
          this.joystickThumb.setPosition(defX, defY);
        }
    this.joystickBase.setStrokeStyle(3, 0xffffff, 0.75);
        this.joystickThumb.setRadius(thumbR);
        if (this.joystickPointerId === null) {
          this.joystickThumb.setPosition(this.joystickBase.x, this.joystickBase.y);
        }
      }
      if (this.actionButton && this.joystickBase) {
        const btnR = baseR * 0.55;
        this.actionButton.setRadius(btnR);
        const ax = this.leftHanded ? baseR * 1.2 : w - baseR * 1.2;
        this.actionButton.setPosition(ax, h - baseR * 1.2);
    this.actionLabel?.setPosition(this.actionButton.x, this.actionButton.y).setFontSize(Math.round(btnR * 0.9));
      }
      if (this.interactButton && this.joystickBase) {
        const btnR2n = baseR * 0.55 * 0.9;
        this.interactButton.setRadius(btnR2n);
        const ix2 = this.leftHanded
          ? (this.isPortrait() ? baseR * 1.1 : baseR * 0.8)
          : w - (this.isPortrait() ? baseR * 1.1 : baseR * 0.8);
        const iy2 = this.isPortrait() ? h - baseR * 2.6 : h - baseR * 2.1;
        this.interactButton.setPosition(ix2, iy2);
    this.interactLabel?.setPosition(ix2, iy2).setFontSize(Math.round(btnR2n * 0.9));
      }
  // Keep player centered on resize/orientation changes
  this.cameras.main.followOffset.set(0, 0);
    };
    this.scale.on('resize', onResize);
    // Also react to orientationchange (some browsers delay Resize event)
    window.addEventListener('orientationchange', () => {
      // trigger Phaser resize recalculation
      // Slight timeout to allow viewport to settle
      setTimeout(() => this.scale.refresh(), 100);
    });
  // Initial layout pass for actual fitted size
  onResize(this.scale.gameSize);
  this.setControlsVisible(this.controlsVisible);
  }

  private buildDungeon() {
    // generate textures for floor/wall if missing
    if (!this.textures.exists('floor-tex')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x2c2c2c, 1);
      g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      g.fillStyle(0x333333, 1);
      g.fillRect(0, 0, TILE_SIZE / 2, TILE_SIZE / 2);
      g.fillRect(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2);
      g.generateTexture('floor-tex', TILE_SIZE, TILE_SIZE);
      g.destroy();
    }
    if (!this.textures.exists('wall-tex')) {
      const wg = this.make.graphics({ x: 0, y: 0 });
      wg.fillStyle(0x5a5a5a, 1);
      wg.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      wg.lineStyle(1, 0x6e6e6e, 1);
      wg.strokeRect(1, 1, TILE_SIZE - 2, TILE_SIZE - 2);
      wg.generateTexture('wall-tex', TILE_SIZE, TILE_SIZE);
      wg.destroy();
    }

    // simple seeded config; later wire to UI/seed param
    const dungeon = generateDungeon({
      seed: 'dev',
      rooms: { min: 7, max: 12, size: { min: 6, max: 14 } },
    });

    // Tile grid: 0 empty, 1 floor, 2 wall
    const cols = this.dungeonCols;
    const rows = this.dungeonRows;
    const grid = new Array(rows)
      .fill(0)
      .map(() => new Array<number>(cols).fill(0));

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < cols && y < rows;

    const carveRoom = (r: Room) => {
      const x0 = clamp(r.x, 1, cols - 2);
      const y0 = clamp(r.y, 1, rows - 2);
      const x1 = clamp(r.x + r.w - 1, 1, cols - 2);
      const y1 = clamp(r.y + r.h - 1, 1, rows - 2);
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) grid[y][x] = 1;
      }
    };
    const carveCorridor = (x1: number, y1: number, x2: number, y2: number) => {
      x1 = clamp(x1, 1, cols - 2);
      y1 = clamp(y1, 1, rows - 2);
      x2 = clamp(x2, 1, cols - 2);
      y2 = clamp(y2, 1, rows - 2);
      // L-shaped: horizontal then vertical
      const step = (a: number, b: number) => (a < b ? 1 : -1);
      for (let x = x1; x !== x2; x += step(x, x2)) grid[y1][x] = 1;
      for (let y = y1; y !== y2; y += step(y, y2)) grid[y][x2] = 1;
      grid[y2][x2] = 1;
    };

    // carve rooms
    dungeon.rooms.forEach((r, idx) => {
      carveRoom(r);
      if (idx === 0) this.startRoom = r;
    });
    // carve corridors
    dungeon.corridors.forEach((c) => carveCorridor(c.x1, c.y1, c.x2, c.y2));

    // build walls around floors
    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        if (grid[y][x] === 1) {
          for (const [dx, dy] of dirs) {
            const nx = x + (dx as number);
            const ny = y + (dy as number);
            if (inBounds(nx, ny) && grid[ny][nx] === 0) grid[ny][nx] = 2;
          }
        }
      }
    }

    // render to a single render texture for performance
    if (this.dungeonRT) this.dungeonRT.destroy();
    this.dungeonRT = this.add.renderTexture(0, 0, cols * TILE_SIZE, rows * TILE_SIZE).setOrigin(0, 0);
    this.dungeonRT.setScrollFactor(1);

    // prepare wall colliders
    this.walls = this.physics.add.staticGroup();

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;
        if (grid[y][x] === 1) {
          this.dungeonRT.draw('floor-tex', px, py);
        } else if (grid[y][x] === 2) {
          this.dungeonRT.draw('wall-tex', px, py);
          const world = tileToWorld(x, y);
          this.walls.create(world.x, world.y, 'wall-tex');
        }
      }
    }

    // collide player later once it's created
    // but add a small parallax background behind dungeon for depth
    if (this.bg) {
      this.bg.setDepth(-10);
    }
  }

  private updateJoystick(px: number, py: number) {
    if (!this.joystickBase || !this.joystickThumb) return;
    const cx = this.joystickBase.x;
    const cy = this.joystickBase.y;
    const max = (this.joystickBase.radius as number) * 0.9;
    const dx = px - cx;
    const dy = py - cy;
    const len = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(len, max);
    const nx = (dx / len) * clamped;
    const ny = (dy / len) * clamped;
    this.joystickThumb.setPosition(cx + nx, cy + ny);
    // normalized vector -1..1
    this.joyVector.set(dx / (this.joystickBase.radius as number), dy / (this.joystickBase.radius as number));
    // deadzone
    if (this.joyVector.length() < 0.1) this.joyVector.set(0, 0);
  }

  private resetJoystick() {
    if (!this.joystickBase || !this.joystickThumb) return;
    this.joystickThumb.setPosition(this.joystickBase.x, this.joystickBase.y);
    this.joyVector.set(0, 0);
  }

  private tintButton(down: boolean) {
    if (!this.actionButton) return;
    this.actionButton.setFillStyle(down ? 0xff7777 : 0xff5555, down ? 0.7 : 0.5);
    this.actionLabel?.setAlpha(down ? 0.95 : 1);
  }

  private tintInteract(down: boolean) {
    if (!this.interactButton) return;
    this.interactButton.setFillStyle(down ? 0x77c0ff : 0x55aaff, down ? 0.7 : 0.5);
    this.interactLabel?.setAlpha(down ? 0.95 : 1);
  }

  private setControlsVisible(v: boolean) {
    this.joystickBase?.setVisible(v);
    this.joystickThumb?.setVisible(v);
    this.actionButton?.setVisible(v);
    this.interactButton?.setVisible(v);
    this.actionLabel?.setVisible(v);
    this.interactLabel?.setVisible(v);
  }
}
