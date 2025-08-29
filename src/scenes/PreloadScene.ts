import Phaser from 'phaser';

// small transparent PNG base64 (1x1)
const BASE64_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // create progress bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4 - 10, height / 2 - 25, width / 2 + 20, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
    });
    loadingText.setStyle({ font: '18px monospace', color: '#ffffff' });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 4, height / 2 - 15, (width / 2) * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load placeholder assets using data URIs so there are no external file dependencies
    this.load.image('logo', BASE64_PNG);
    this.load.image('loading-bar', BASE64_PNG);
    this.load.image('player', BASE64_PNG);
    this.load.image('tiles', BASE64_PNG);
    this.load.image('ui-panel', BASE64_PNG);

    // start the loader
  }

  create() {
    this.scene.start('MainMenuScene');
  }
}
