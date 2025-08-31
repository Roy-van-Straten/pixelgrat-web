import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // Immediately transition to preload; Boot doesn't load external assets
    // Hook orientation changes early so Scale refresh occurs regardless of active scene
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.scale.refresh(), 50);
    });
    this.scene.start('PreloadScene');
  }
}
