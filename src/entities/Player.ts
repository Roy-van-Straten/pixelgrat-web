import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    Player.ensureTextures(scene);
    super(scene, x, y, 'player-0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    Player.initAnims(scene);
    this.setOrigin(0.5, 0.5);
    this.setCollideWorldBounds(true);
    this.play('player-idle');
  }

  static initAnims(scene: Phaser.Scene) {
    const anims = scene.anims;

    if (!anims.exists('player-walk')) {
      anims.create({
        key: 'player-walk',
        frames: [
          { key: 'player-0' },
          { key: 'player-1' },
          { key: 'player-2' },
          { key: 'player-1' },
        ],
        frameRate: 6,
        repeat: -1,
      });
    }

    if (!anims.exists('player-idle')) {
      anims.create({
        key: 'player-idle',
        frames: [{ key: 'player-0' }],
        frameRate: 1,
        repeat: -1,
      });
    }
  }

  static ensureTextures(scene: Phaser.Scene) {
    const tex = scene.textures;
    if (tex.exists('player-0') && tex.exists('player-1') && tex.exists('player-2')) {
      return;
    }

    const w = 14;
    const h = 16;

    const makeFrame = (key: string, accentOffset: number) => {
      const g = scene.make.graphics({ x: 0, y: 0 });
      // body
      g.fillStyle(0x375a7f, 1); // tunic
      g.fillRect(3, 5, 8, 8);
      // head
      g.fillStyle(0xe0c39a, 1);
      g.fillRect(4, 1, 6, 4);
      // belt/accent changes to fake walking motion
      g.fillStyle(0x2c3e50, 1);
      g.fillRect(3 + accentOffset, 9, 8 - accentOffset * 2, 2);
      // boots
      g.fillStyle(0x3b2d1f, 1);
      g.fillRect(3, 13, 3, 2);
      g.fillRect(8, 13, 3, 2);
      g.generateTexture(key, w, h);
      g.destroy();
    };

    makeFrame('player-0', 0);
    makeFrame('player-1', 1);
    makeFrame('player-2', 0);
  }
}

export default Player;
