import Phaser from 'phaser';
import { isMobileLike } from './systems/device';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { PlayScene } from './scenes/PlayScene';

const isPortraitAtBoot = window.innerHeight > window.innerWidth;
const BASE_LAND = { w: 960, h: 540 };
const BASE_PORT = { w: 540, h: 960 };
const base = isPortraitAtBoot ? BASE_PORT : BASE_LAND;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: base.w,
  height: base.h,
  parent: 'game-root',
  backgroundColor: '#181818',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: isMobileLike() ? 1 : Math.min(2, window.devicePixelRatio || 1),
    expandParent: true,
    autoRound: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, MainMenuScene, PlayScene],
};

const game = new Phaser.Game(config);

// scenes are registered in config; BootScene starts first
