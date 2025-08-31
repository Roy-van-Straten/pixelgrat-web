import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private bg?: Phaser.GameObjects.TileSprite;
  constructor() {
    super('MainMenuScene');
  }

  create() {
  const { width, height } = this.cameras.main;

    // Create a tiny 8x8 pixel-art tile procedurally and tile it as a background
    const tile = 8;
  const g = this.make.graphics({ x: 0, y: 0 });
    // base dark parchment/stone tone
    g.fillStyle(0x3b2d1f, 1);
    g.fillRect(0, 0, tile, tile);
    // lighter accents to create a subtle checker/brick feel
    g.fillStyle(0x5a412c, 1);
    g.fillRect(0, 0, 4, 4);
    g.fillRect(4, 4, 4, 4);
    g.generateTexture('menu-bg-tile', tile, tile);
    g.destroy();

  this.bg = this.add.tileSprite(0, 0, width, height, 'menu-bg-tile').setOrigin(0);
    // dark overlay for readability
    this.add.rectangle(0, 0, width, height, 0x000000, 0.25).setOrigin(0);
  const isSmall = Math.min(width, height) < 800;
    const title = this.add.text(width / 2, height / 2 - (isSmall ? 100 : 120), 'Pixelgrat', {
      fontFamily: 'monospace',
      fontSize: isSmall ? '40px' : '48px',
      color: '#ffffff',
    });
    title.setOrigin(0.5);

    const makeButton = (y: number, label: string, onClick: () => void) => {
      const btn = this.add.text(width / 2, y, label, {
        fontFamily: 'monospace',
        fontSize: isSmall ? '26px' : '28px',
        color: '#ffffff',
      });
      btn.setOrigin(0.5);
      // Expand hit area for touch
      const pad = isSmall ? 24 : 18;
      const bg = this.add.rectangle(width / 2, y, btn.width + pad * 2, btn.height + pad, 0x000000, 0.25).setOrigin(0.5);
      bg.setStrokeStyle(2, 0xffffff, 0.4);
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setStrokeStyle(2, 0xffd166, 0.8));
      bg.on('pointerout', () => bg.setStrokeStyle(2, 0xffffff, 0.4));
      bg.on('pointerup', onClick);
      btn.setDepth(1);
      bg.setDepth(0);
      btn.setInteractive({ useHandCursor: true }).on('pointerup', onClick);
      btn.on('pointerover', () => btn.setStyle({ color: '#ffd166' }));
      btn.on('pointerout', () => btn.setStyle({ color: '#ffffff' }));
      return btn;
    };

  const gap = isSmall ? 70 : 64;
    makeButton(height / 2 - gap, 'New Game', () => {
      this.scene.start('PlayScene');
    });
    makeButton(height / 2, 'Continue', () => {
      console.log('Continue clicked');
      // TODO: load save and transition when persistence is ready
    });
    makeButton(height / 2 + gap, 'Sandbox', () => {
      console.log('Sandbox clicked');
      // TODO: start sandbox mode
    });

    // Handle orientation/resize
    this.scale.on('resize', (g: Phaser.Structs.Size) => {
      const w = g.width;
      const h = g.height;
      if (this.bg) this.bg.setSize(w, h);
    });
  }

  update() {
    if (this.bg) {
      this.bg.tilePositionX += 0.1; // subtle parallax
    }
  }
}
