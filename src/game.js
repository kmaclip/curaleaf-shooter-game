import { setupPlayer, updatePlayer } from './player.js';
import { setupEnemies, updateEnemies, spawnEnemy } from './enemies.js';
import { setupRooms, tryMoveRoom } from './rooms.js';
import { setupUI, updateUI } from './ui.js';

export function startGame() {
  const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 600,
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: { preload, create, update },
    parent: 'phaser-game'
  };
  new Phaser.Game(config);
}

function preload() {
  this.load.image('curaleaf', 'assets/logos/curaleaf.png');
  this.load.image('nugget', 'assets/projectiles/nugget.png');
  this.load.image('trulieve', 'assets/logos/trulieve.png');
  this.load.image('ayr', 'assets/logos/ayr.png');
  this.load.image('fluent', 'assets/logos/fluent.png');
  this.load.image('flowery', 'assets/logos/flowery.png');
  this.load.image('muv', 'assets/logos/muv.png');
  this.load.image('ground', 'assets/projectiles/ground.png');
  this.load.image('rosin', 'assets/effects/rosin.png');
  this.load.image('preroll', 'assets/effects/preroll.png');
  this.load.image('xbite', 'assets/effects/xbite.png');
  this.load.image('key', 'assets/effects/key.png');
  this.load.image('cookies', 'assets/logos/cookies.png');
  this.load.image('chocolate', 'assets/effects/chocolate.png');
  this.load.image('tincture', 'assets/effects/tincture.png');
  this.load.image('rsocapsule', 'assets/effects/rsocapsule.png');
  this.load.image('squeeze', 'assets/effects/squeeze.png');
}

function create() {
  this.gameState = {
    score: 0,
    level: 1,
    playerHealth: 100,
    tripleFireActive: false,
    barrierActive: false,
    chargeLevel: 0,
    consecutiveKills: 0,
    hasKey: false,
    currentRoom: { x: 0, y: 0 },
    lastMoveTime: 0,
    lastRoomChangeTime: 0,
    lastShootTime: 0,
    roomEnemies: {},
    dynamicEvents: [],
    enemyShields: {},
    shieldHP: 0,
    tripleShotTimer: 0,
    speedBoostTimer: 0,
    slowShotTimer: 0
  };

  this.cameras.main.setBackgroundColor('#000000');
  this.cameras.main.setBounds(0, 0, 960, 600);
  this.physics.world.setBounds(0, 0, 960, 600);

  setupRooms(this);
  setupPlayer(this);
  setupEnemies(this);
  setupUI(this);

  this.time.addEvent({
    delay: 3000,
    callback: spawnEnemy,
    callbackScope: this,
    loop: true
  });

  this.time.addEvent({
    delay: 1000,
    callback: () => {
      if (this.player && !this.physics.world.isPaused) {
        this.player.shootNugget();
        this.gameState.lastShootTime = this.time.now;
      }
    },
    callbackScope: this,
    loop: true
  });

  this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  this.isPaused = false;
}

function update(time, delta) {
  if (this.physics.world.isPaused && !this.isPaused && !this.gameOver) return;

  if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
    this.isPaused = !this.isPaused;
    this.physics.world.isPaused = this.isPaused;
    if (this.isPaused) {
      showPauseMenu(this);
    } else {
      hidePauseMenu(this);
    }
  }

  if (this.isPaused || this.gameOver) return;

  try {
    updatePlayer(this, time, delta);
    updateEnemies(this, delta);
    updateUI(this);
    tryMoveRoom(this, time);

    this.gameState.dynamicEvents = this.gameState.dynamicEvents.filter(event => {
      if (time >= event.endTime) {
        if (event.type === 'firePit') {
          removeFirePitEffect(this, event.x, event.y);
        } else if (event.type === 'windGust') {
          removeWindGust(this, event.x, event.y, event.direction);
        }
        return false;
      }
      return true;
    });

    if (this.gameState.tripleShotTimer > 0) {
      this.gameState.tripleShotTimer -= delta;
      if (this.gameState.tripleShotTimer <= 0) this.gameState.tripleShotTimer = 0;
    }
    if (this.gameState.speedBoostTimer > 0) {
      this.gameState.speedBoostTimer -= delta;
      if (this.gameState.speedBoostTimer <= 0) this.gameState.speedBoostTimer = 0;
    }
    if (this.gameState.slowShotTimer > 0) {
      this.gameState.slowShotTimer -= delta;
      if (this.gameState.slowShotTimer <= 0) this.gameState.slowShotTimer = 0;
    }

    if (this.gameState.playerHealth <= 0 && !this.gameOver) {
      this.gameOver = true;
      this.physics.world.isPaused = true;
      showGameOver(this);
    }
  } catch (e) {
    console.error('Update loop error:', e);
  }
}

function showPauseMenu(scene) {
  scene.pauseOverlay = scene.add.rectangle(480, 300, 960, 600, 0x000000, 0.7).setDepth(10);
  scene.pauseText = scene.add.text(480, 250, 'PAUSED', { fontSize: '32px', fill: '#FFF' }).setOrigin(0.5).setDepth(11);
  scene.restartText = scene.add.text(480, 350, 'Restart (Press R)', { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5).setDepth(11);
  
  scene.restartKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  scene.restartKey.on('down', () => {
    scene.gameState.consecutiveKills = 0;
    scene.gameState.shieldHP = 0;
    scene.gameState.tripleShotTimer = 0;
    scene.gameState.speedBoostTimer = 0;
    scene.gameState.slowShotTimer = 0;
    scene.scene.restart();
    scene.isPaused = false;
  });
}

function hidePauseMenu(scene) {
  if (scene.pauseOverlay) scene.pauseOverlay.destroy();
  if (scene.pauseText) scene.pauseText.destroy();
  if (scene.restartText) scene.restartText.destroy();
  if (scene.restartKey) scene.restartKey.off('down');
}

function showGameOver(scene) {
  scene.gameOverOverlay = scene.add.rectangle(480, 300, 960, 600, 0x000000, 0.7).setDepth(10);
  scene.gameOverText = scene.add.text(480, 250, 'GAME OVER', { fontSize: '32px', fill: '#FFF' }).setOrigin(0.5).setDepth(11);
  scene.restartText = scene.add.text(480, 350, 'Restart (Press R)', { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5).setDepth(11);

  scene.restartKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  scene.restartKey.on('down', () => {
    scene.gameState.consecutiveKills = 0;
    scene.gameState.shieldHP = 0;
    scene.gameState.tripleShotTimer = 0;
    scene.gameState.speedBoostTimer = 0;
    scene.gameState.slowShotTimer = 0;
    scene.gameOver = false;
    scene.scene.restart();
  });
}

function removeFirePitEffect(scene, x, y) {
  const index = scene.dungeonTexts.findIndex(text => text.x === x * 48 + 24 && text.y === y * 48 + 24);
  if (index !== -1 && scene.dungeonGrid[y][x] === 8) {
    scene.dungeonGrid[y][x] = 0;
    scene.dungeonTexts[index].setText('.').setFill('#666');
    scene.colliders.children.each(collider => {
      if (collider.x === x * 48 + 24 && collider.y === y * 48 + 24) collider.destroy();
    });
  }
}

function removeWindGust(scene, x, y, direction) {
  const index = scene.dungeonTexts.findIndex(text => text.x === x * 48 + 24 && text.y === y * 48 + 24);
  if (index !== -1 && [9, 10].includes(scene.dungeonGrid[y][x])) {
    scene.dungeonGrid[y][x] = 0;
    scene.dungeonTexts[index].setText('.').setFill('#666');
    scene.colliders.children.each(collider => {
      if (collider.x === x * 48 + 24 && collider.y === y * 48 + 24) collider.destroy();
    });
  }
}