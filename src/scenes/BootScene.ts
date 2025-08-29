import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // Immediately transition to preload; Boot doesn't load external assets
    this.scene.start('PreloadScene');
  }
}
