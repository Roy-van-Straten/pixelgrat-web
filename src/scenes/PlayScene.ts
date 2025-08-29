import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class PlayScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private bg?: Phaser.GameObjects.TileSprite;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private interactables!: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super('PlayScene');
  }

  create() {
    const { width, height } = this.cameras.main;

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

  // world bounds larger than viewport
  const worldWidth = width * 3;
  const worldHeight = height * 3;
  this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
  this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

  // create player in the center of the world
  this.player = new Player(this, worldWidth / 2, worldHeight / 2);

    // input
  const keyboard = this.input.keyboard!;
  this.cursors = keyboard.createCursorKeys();
  this.wasd = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
    // camera follow with smoothing
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    // --- Walls & Obstacles ---
    // create a simple stone tile texture
    const wallTile = 32;
    const wg = this.make.graphics({ x: 0, y: 0 });
    wg.fillStyle(0x5a5a5a, 1);
    wg.fillRect(0, 0, wallTile, wallTile);
    wg.fillStyle(0x6e6e6e, 1);
    wg.fillRect(0, 0, 16, 16);
    wg.fillRect(16, 16, 16, 16);
    wg.generateTexture('wall-tex', wallTile, wallTile);
    wg.destroy();

    this.walls = this.physics.add.staticGroup();

    // border walls
    for (let x = 0; x < worldWidth; x += wallTile) {
      this.walls.create(x + wallTile / 2, wallTile / 2, 'wall-tex'); // top
      this.walls.create(x + wallTile / 2, worldHeight - wallTile / 2, 'wall-tex'); // bottom
    }
    for (let y = wallTile; y < worldHeight - wallTile; y += wallTile) {
      this.walls.create(wallTile / 2, y + wallTile / 2, 'wall-tex'); // left
      this.walls.create(worldWidth - wallTile / 2, y + wallTile / 2, 'wall-tex'); // right
    }

    // starting room around spawn (so player is not obscured by a wall)
    const tileSize = wallTile;
    const roomCols = 12;
    const roomRows = 8;
    const roomCX = worldWidth / 2;
    const roomCY = worldHeight / 2;
    const roomW = roomCols * tileSize;
    const roomH = roomRows * tileSize;
    const roomLeft = roomCX - roomW / 2;
    const roomTop = roomCY - roomH / 2;

    // Perimeter walls with a doorway at the top center (2 tiles wide)
    const doorCols = 2;
    const doorStartCol = Math.floor(roomCols / 2) - Math.floor(doorCols / 2);

    for (let c = 0; c < roomCols; c++) {
      // top edge (skip doorway)
      if (c < doorStartCol || c >= doorStartCol + doorCols) {
        this.walls.create(roomLeft + c * tileSize + tileSize / 2, roomTop + tileSize / 2, 'wall-tex');
      }
      // bottom edge
      this.walls.create(
        roomLeft + c * tileSize + tileSize / 2,
        roomTop + roomH - tileSize / 2,
        'wall-tex'
      );
    }
    for (let r = 1; r < roomRows - 1; r++) {
      // left and right edges
      this.walls.create(roomLeft + tileSize / 2, roomTop + r * tileSize + tileSize / 2, 'wall-tex');
      this.walls.create(
        roomLeft + roomW - tileSize / 2,
        roomTop + r * tileSize + tileSize / 2,
        'wall-tex'
      );
    }

    // decorative pillars at the room's inner corners (not at player spawn)
    const innerOffset = tileSize * 1.5;
    const innerPillars = [
      { x: roomLeft + innerOffset, y: roomTop + innerOffset },
      { x: roomLeft + roomW - innerOffset, y: roomTop + innerOffset },
      { x: roomLeft + innerOffset, y: roomTop + roomH - innerOffset },
      { x: roomLeft + roomW - innerOffset, y: roomTop + roomH - innerOffset },
    ];
    innerPillars.forEach((p) => this.walls.create(p.x, p.y, 'wall-tex'));

    this.physics.add.collider(this.player, this.walls);

    // --- Interactables (non-blocking) ---
    // create a small chest-like tile
    const ig = this.make.graphics({ x: 0, y: 0 });
    ig.fillStyle(0x8b5a2b, 1); // wood
    ig.fillRect(0, 0, 16, 12);
    ig.fillStyle(0x3f2a16, 1); // darker band
    ig.fillRect(0, 5, 16, 2);
    ig.generateTexture('interactable-tex', 16, 12);
    ig.destroy();

    this.interactables = this.physics.add.staticGroup();
  // place a chest inside the starting room
  const chest = this.interactables.create(roomCX + tileSize * 2, roomCY, 'interactable-tex');
    // make sure chest doesn't block movement: use overlap, not collider
    this.physics.add.overlap(this.player, this.interactables, () => {
      // placeholder: show in console for now
      // eslint-disable-next-line no-console
      console.log('Interactable nearby: Press E (placeholder)');
    });
  }

  update() {
    const speed = 120;
    let vx = 0;
    let vy = 0;

    const up = this.cursors.up?.isDown || this.wasd.up.isDown;
    const down = this.cursors.down?.isDown || this.wasd.down.isDown;
    const left = this.cursors.left?.isDown || this.wasd.left.isDown;
    const right = this.cursors.right?.isDown || this.wasd.right.isDown;

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
  }
}
