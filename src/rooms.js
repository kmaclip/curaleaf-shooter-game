import { configureEnemyBehavior } from './enemies.js'; // Import the function

export function setupRooms(scene) {
  generateDungeon(scene);
}

function generateDungeon(scene) {
  const { currentRoom } = scene.gameState;

  if (scene.dungeonTexts) {
    scene.dungeonTexts.forEach(text => text.destroy());
  }
  scene.dungeonTexts = [];
  if (scene.colliders) {
    scene.colliders.children.each(collider => collider.destroy());
    scene.colliders.clear(true, true);
  }
  scene.colliders = scene.physics.add.group();

  scene.dungeonGrid = Array(12).fill().map(() => Array(20).fill(0));
  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 20; x++) {
      if (x === 0 || x === 19 || y === 0 || y === 11) scene.dungeonGrid[y][x] = 1;
    }
  }

  let isDangerous = false;
  let hasWater = false;
  let hasTrees = false;

  const roomDistance = Math.abs(currentRoom.x) + Math.abs(currentRoom.y);
  if (roomDistance > 0 && roomDistance % 10 === 0) {
    scene.gameState.isBossRoom = true;
    scene.dungeonGrid[5][1] = scene.dungeonGrid[6][1] = 3; // Left door
    scene.dungeonGrid[5][18] = scene.dungeonGrid[6][18] = 3; // Right door
    scene.dungeonGrid[1][9] = scene.dungeonGrid[1][10] = 3; // Up door
    scene.dungeonGrid[10][9] = scene.dungeonGrid[10][10] = 3; // Down door

    const boss = scene.enemies.create(480, 288, 'trulieve').setScale(0.5);
    configureEnemyBehavior(scene, boss, 'trulieve_boss'); // Now accessible
    scene.gameState.roomEnemies[`${currentRoom.x},${currentRoom.y}`] = [boss];
  } else {
    scene.gameState.isBossRoom = false;
    const roomType = Phaser.Math.Between(0, 3);

    if (roomType === 0 && (currentRoom.x !== 0 || currentRoom.y !== 0)) {
      isDangerous = true;
    } else if (roomType === 1) {
      hasWater = true;
    } else if (roomType === 2) {
      hasTrees = true;
    }

    scene.dungeonGrid[5][1] = scene.dungeonGrid[6][1] = 3;
    scene.dungeonGrid[5][18] = scene.dungeonGrid[6][18] = 3;
    scene.dungeonGrid[1][9] = scene.dungeonGrid[1][10] = 3;
    scene.dungeonGrid[10][9] = scene.dungeonGrid[10][10] = 3;

    if (currentRoom.x !== 0 || currentRoom.y !== 0) {
      if (Phaser.Math.Between(0, 2) === 0) {
        const side = Phaser.Math.Between(0, 3);
        if (side === 0) {
          scene.dungeonGrid[5][1] = scene.dungeonGrid[6][1] = Phaser.Math.Between(0, 3) === 0 ? 24 : 7;
        } else if (side === 1) {
          scene.dungeonGrid[5][18] = scene.dungeonGrid[6][18] = Phaser.Math.Between(0, 3) === 0 ? 24 : 7;
        } else if (side === 2) {
          scene.dungeonGrid[1][9] = scene.dungeonGrid[1][10] = Phaser.Math.Between(0, 3) === 0 ? 24 : 7;
        } else {
          scene.dungeonGrid[10][9] = scene.dungeonGrid[10][10] = Phaser.Math.Between(0, 3) === 0 ? 24 : 7;
        }
      }
    }

    if (hasWater) {
      for (let i = 0; i < Phaser.Math.Between(3, 6); i++) {
        const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
        if (scene.dungeonGrid[y][x] === 0) scene.dungeonGrid[y][x] = 12;
      }
      if (Phaser.Math.Between(0, 2) === 0) {
        const bridgeCenterX = Phaser.Math.Between(6, 13);
        scene.dungeonGrid[7][bridgeCenterX] = 15;
        scene.dungeonGrid[7][bridgeCenterX - 1] = 15;
        scene.dungeonGrid[7][bridgeCenterX + 1] = 12;
        scene.dungeonGrid[7][bridgeCenterX - 2] = 12;
      }
      for (let i = 0; i < Phaser.Math.Between(1, 3); i++) {
        const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
        if (scene.dungeonGrid[y][x] === 0 || scene.dungeonGrid[y][x] === 14) {
          if (Phaser.Math.Between(0, 1) === 0) scene.dungeonGrid[y][x] = 13;
          else if (scene.dungeonGrid[y][x] === 0) scene.dungeonGrid[y][x] = 14;
        }
      }
    } else if (hasTrees) {
      for (let i = 0; i < Phaser.Math.Between(4, 8); i++) {
        const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
        if (scene.dungeonGrid[y][x] === 0 || scene.dungeonGrid[y][x] === 14) {
          if (Phaser.Math.Between(0, 1) === 0) scene.dungeonGrid[y][x] = 13;
          else if (scene.dungeonGrid[y][x] === 0) scene.dungeonGrid[y][x] = 14;
        }
      }
      const lakeCenterX = Phaser.Math.Between(5, 14);
      const lakeCenterY = Phaser.Math.Between(4, 7);
      const lakeRadius = 2;
      for (let dy = -lakeRadius; dy <= lakeRadius; dy++) {
        for (let dx = -lakeRadius; dx <= lakeRadius; dx++) {
          const newX = lakeCenterX + dx, newY = lakeCenterY + dy;
          if (newX >= 2 && newX <= 17 && newY >= 2 && newY <= 9 && 
              Math.sqrt(dx * dx + dy * dy) <= lakeRadius && scene.dungeonGrid[newY][newX] === 0) {
            scene.dungeonGrid[newY][newX] = 12;
          }
        }
      }
    } else if (isDangerous) {
      for (let i = 0; i < Phaser.Math.Between(1, 3); i++) {
        const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
        if (scene.dungeonGrid[y][x] === 0) scene.dungeonGrid[y][x] = 7;
      }
      for (let i = 0; i < Phaser.Math.Between(1, 2); i++) {
        const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
        if (scene.dungeonGrid[y][x] === 0) scene.dungeonGrid[y][x] = 5;
      }
      if (Phaser.Math.Between(0, 3) === 0) {
        for (let i = 0; i < Phaser.Math.Between(1, 3); i++) {
          const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
          if (scene.dungeonGrid[y][x] === 0) scene.dungeonGrid[y][x] = 16;
        }
      }
      if (Phaser.Math.Between(0, 2) === 0) {
        for (let i = 0; i < Phaser.Math.Between(1, 2); i++) {
          const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
          if (scene.dungeonGrid[y][x] === 0) {
            scene.dungeonGrid[y][x] = Phaser.Math.Between(0, 1) === 0 ? 17 : 18;
          }
        }
      }
      for (let i = 0; i < Phaser.Math.Between(1, 3); i++) {
        const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
        if (scene.dungeonGrid[y][x] === 0 || scene.dungeonGrid[y][x] === 14) {
          scene.dungeonGrid[y][x] = 13;
        }
      }
    } else {
      for (let i = 0; i < Phaser.Math.Between(2, 4); i++) {
        const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
        if (scene.dungeonGrid[y][x] === 0) scene.dungeonGrid[y][x] = 2;
      }
      for (let i = 0; i < Phaser.Math.Between(3, 6); i++) {
        const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
        if (scene.dungeonGrid[y][x] === 0) scene.dungeonGrid[y][x] = 4;
      }
      for (let i = 0; i < Phaser.Math.Between(1, 2); i++) {
        const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
        if (scene.dungeonGrid[y][x] === 0) scene.dungeonGrid[y][x] = 5;
      }
      for (let i = 0; i < Phaser.Math.Between(1, 2); i++) {
        const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
        if (scene.dungeonGrid[y][x] === 0) {
          scene.dungeonGrid[y][x] = 6;
          if (Phaser.Math.Between(0, 1) === 1) {
            const trapX = Phaser.Math.Clamp(x + Phaser.Math.Between(-1, 1), 2, 17);
            const trapY = Phaser.Math.Clamp(y + Phaser.Math.Between(-1, 1), 2, 9);
            if (scene.dungeonGrid[trapY][trapX] === 0) scene.dungeonGrid[trapY][trapX] = 5;
          }
        }
      }
      for (let i = 0; i < Phaser.Math.Between(1, 3); i++) {
        const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
        if (scene.dungeonGrid[y][x] === 0 || scene.dungeonGrid[y][x] === 14) {
          scene.dungeonGrid[y][x] = 13;
        }
      }
      if (Phaser.Math.Between(0, 9) === 0) {
        for (let i = 0; i < Phaser.Math.Between(1, 3); i++) {
          const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
          if (scene.dungeonGrid[y][x] === 0) scene.dungeonGrid[y][x] = 12;
        }
      }
      if (Phaser.Math.Between(0, 9) === 0) {
        for (let i = 0; i < Phaser.Math.Between(1, 3); i++) {
          const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
          if (scene.dungeonGrid[y][x] === 0) scene.dungeonGrid[y][x] = 14;
        }
      }
    }

    scene.powerUpSprites = scene.powerUpSprites || [];
    for (let i = 0; i < Phaser.Math.Between(1, 3); i++) {
      const x = Phaser.Math.Between(2, 17), y = Phaser.Math.Between(2, 9);
      if (scene.dungeonGrid[y][x] === 0) {
        const powerUpType = Phaser.Math.Between(19, 23);
        scene.dungeonGrid[y][x] = powerUpType;
        const spriteKey = powerUpType === 19 ? 'preroll' : powerUpType === 20 ? 'rosin' : powerUpType === 21 ? 'tincture' : powerUpType === 22 ? 'rsocapsule' : 'squeeze';
        const sprite = scene.add.sprite(x * 48 + 24, y * 48 + 24, spriteKey).setScale(0.2).setDepth(2);
        sprite.gridX = x;
        sprite.gridY = y;
        scene.powerUpSprites.push(sprite);
      }
    }
  }

  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 20; x++) {
      let char, color;
      switch (scene.dungeonGrid[y][x]) {
        case 1: char = '|'; color = '#888'; break;
        case 2: char = 'B'; color = '#666'; break;
        case 3: char = '#'; color = '#8B4513'; break;
        case 4: char = 'T'; color = '#FFA500'; break;
        case 5: char = 'X'; color = '#FF0000'; break;
        case 6: char = '$'; color = '#FFD700'; break;
        case 7: char = '~'; color = '#FF0000'; break;
        case 12: char = 'W'; color = '#0000FF'; break;
        case 13: char = '^'; color = '#90EE90'; break;
        case 14: char = 'O'; color = '#808080'; break;
        case 15: char = '='; color = '#8B4513'; break;
        case 16: char = 'F'; color = '#FF4500'; break;
        case 17: char = '>'; color = '#808080'; break;
        case 18: char = '<'; color = '#808080'; break;
        case 19: char = ''; color = '#FFFFFF'; break;
        case 20: char = ''; color = '#FFFFFF'; break;
        case 21: char = ''; color = '#FFFFFF'; break;
        case 22: char = ''; color = '#FFFFFF'; break;
        case 23: char = ''; color = '#FFFFFF'; break;
        case 24: char = 'D'; color = '#FF0000'; break;
        default: char = '.'; color = '#666'; break;
      }
      const text = scene.add.text(x * 48 + 24, y * 48 + 24, char, { fontSize: '32px', fill: color }).setOrigin(0.5);
      scene.dungeonTexts.push(text);

      if ([1, 2, 7, 12, 13, 14, 16, 17, 18, 24].includes(scene.dungeonGrid[y][x])) {
        const collider = scene.physics.add.sprite(x * 48 + 24, y * 48 + 24).setSize(48, 48).setVisible(false);
        collider.setImmovable(true);
        scene.colliders.add(collider);
      }
    }
  }

  if (currentRoom.x === 1 && currentRoom.y === 1 && !scene.gameState.hasKey) {
    if (scene.key) scene.key.destroy();
    try {
      scene.key = scene.physics.add.sprite(10 * 48, 6 * 48, 'key').setScale(0.2);
    } catch (e) {
      console.error('Failed to load key sprite:', e);
      scene.key = null;
    }
  }

  if (!scene.gameState.isBossRoom) {
    setupDynamicEvents(scene);
  }

  if (scene.player) {
    scene.physics.add.collider(scene.player, scene.colliders);
  }
  if (scene.enemies) {
    scene.physics.add.collider(scene.enemies, scene.colliders);
  }
  if (scene.bullets) {
    scene.physics.add.collider(scene.bullets, scene.colliders, (bullet) => {
      if (bullet) bullet.destroy();
    });
  }
  if (scene.key && scene.player) {
    scene.physics.add.collider(scene.player, scene.key);
  }
}

function setupDynamicEvents(scene) {
  const { dungeonGrid, gameState } = scene;

  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 20; x++) {
      if (dungeonGrid[y][x] === 16) {
        scene.time.addEvent({
          delay: Phaser.Math.Between(3000, 5000),
          callback: () => triggerFirePit(scene, x, y),
          callbackScope: scene,
          loop: true
        });
      }
    }
  }

  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 20; x++) {
      if (dungeonGrid[y][x] === 17 || dungeonGrid[y][x] === 18) {
        scene.time.addEvent({
          delay: Phaser.Math.Between(4000, 6000),
          callback: () => triggerWindGust(scene, x, y, dungeonGrid[y][x] === 17 ? 'right' : 'left'),
          callbackScope: scene,
          loop: true
        });
      }
    }
  }
}

function triggerFirePit(scene, x, y) {
  const { dungeonGrid, gameState } = scene;
  const directions = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  const validDirections = directions.filter(([dx, dy]) => {
    const newX = x + dx, newY = y + dy;
    return newX >= 0 && newX < 20 && newY >= 0 && newY < 12 && dungeonGrid[newY][newX] === 0;
  });
  if (validDirections.length > 0) {
    const [dx, dy] = validDirections[Phaser.Math.Between(0, validDirections.length - 1)];
    const newX = x + dx, newY = y + dy;
    dungeonGrid[newY][newX] = 8;
    const textIndex = scene.dungeonTexts.findIndex(text => text.x === newX * 48 + 24 && text.y === newY * 48 + 24);
    if (textIndex !== -1) {
      scene.dungeonTexts[textIndex].setText('~').setFill('#FF0000');
    }
    const collider = scene.physics.add.sprite(newX * 48 + 24, newY * 48 + 24).setSize(48, 48).setVisible(false).setImmovable(true);
    scene.colliders.add(collider);
    gameState.dynamicEvents.push({ type: 'firePit', x: newX, y: newY, endTime: scene.time.now + 1000 });
  }
}

function triggerWindGust(scene, x, y, direction) {
  const { dungeonGrid, gameState } = scene;
  dungeonGrid[y][x] = direction === 'right' ? 9 : 10;
  const textIndex = scene.dungeonTexts.findIndex(text => text.x === x * 48 + 24 && text.y === y * 48 + 24);
  if (textIndex !== -1) {
    scene.dungeonTexts[textIndex].setText(direction === 'right' ? '>' : '<').setFill('#808080');
  }
  const collider = scene.physics.add.sprite(x * 48 + 24, y * 48 + 24).setSize(48, 48).setVisible(false).setImmovable(true);
  scene.colliders.add(collider);
  gameState.dynamicEvents.push({ type: 'windGust', x, y, direction, endTime: scene.time.now + 1000 });
}

export function tryMoveRoom(scene, time) {
  const { player, gameState } = scene;
  const ROOM_COOLDOWN = 500;
  if (time - gameState.lastRoomChangeTime < ROOM_COOLDOWN) return;

  let dx = 0, dy = 0;
  let exitX, exitY, enterX, enterY;

  if (player.gridX === 1 && (player.gridY === 5 || player.gridY === 6)) {
    dx = -1;
    exitX = 0;
    exitY = player.gridY * 48;
    enterX = 16 * 48;
    enterY = player.gridY * 48;
  } else if (player.gridX === 18 && (player.gridY === 5 || player.gridY === 6)) {
    dx = 1;
    exitX = 19 * 48;
    exitY = player.gridY * 48;
    enterX = 3 * 48;
    enterY = player.gridY * 48;
  } else if (player.gridY === 1 && (player.gridX === 9 || player.gridX === 10)) {
    dy = -1;
    exitX = player.gridX * 48;
    exitY = 0;
    enterX = player.gridX * 48;
    enterY = 9 * 48;
  } else if (player.gridY === 10 && (player.gridX === 9 || player.gridX === 10)) {
    dy = 1;
    exitX = player.gridX * 48;
    exitY = 11 * 48;
    enterX = player.gridX * 48;
    enterY = 2 * 48;
  }

  if (dx || dy) {
    const doorTile = scene.dungeonGrid[player.gridY][player.gridX];
    if (doorTile === 7 && !gameState.hasKey) {
      scene.add.text(480, 300, 'DOOR LOCKED!', { fontSize: '32px', fill: '#FFF' })
        .setOrigin(0.5).setDepth(10).destroy(1000);
      return;
    } else if (doorTile === 24) {
      if (gameState.hasKey) {
        gameState.hasKey = false;
        scene.dungeonGrid[player.gridY][player.gridX] = 3;
        scene.dungeonTexts[player.gridY * 20 + player.gridX].setText('#').setFill('#8B4513');
        scene.add.text(480, 300, 'DOOR UNLOCKED!', { fontSize: '32px', fill: '#FFF' })
          .setOrigin(0.5).setDepth(10).destroy(1000);
      } else {
        scene.add.text(480, 300, 'NEED KEY!', { fontSize: '32px', fill: '#FFF' })
          .setOrigin(0.5).setDepth(10).destroy(1000);
        return;
      }
    }

    const oldRoomKey = `${gameState.currentRoom.x},${gameState.currentRoom.y}`;
    gameState.currentRoom.x += dx;
    gameState.currentRoom.y += dy;

    scene.physics.world.isPaused = true;

    scene.tweens.add({
      targets: player,
      x: exitX,
      y: exitY,
      duration: 200,
      ease: 'Linear',
      onComplete: () => {
        scene.cameras.main.fadeOut(300, 0, 0, 0, (camera, progress) => {
          if (progress === 1) {
            if (gameState.roomEnemies && gameState.roomEnemies[oldRoomKey]) {
              gameState.roomEnemies[oldRoomKey].forEach(enemy => {
                if (enemy && enemy.active) enemy.destroy();
              });
              gameState.roomEnemies[oldRoomKey] = [];
            }
            scene.enemies.clear(true, true);
            scene.bullets.clear(true, true);
            scene.enemyProjectiles.clear(true, true);

            if (scene.powerUpSprites) {
              scene.powerUpSprites.forEach(sprite => sprite.destroy());
              scene.powerUpSprites = [];
            }

            generateDungeon(scene);
            gameState.dynamicEvents = [];

            player.setPosition(enterX, enterY);
            player.gridX = Math.floor(enterX / 48);
            player.gridY = Math.floor(enterY / 48);

            scene.cameras.main.fadeIn(300, 0, 0, 0, (camera, progress) => {
              if (progress === 1) {
                scene.physics.world.isPaused = false;
                gameState.lastRoomChangeTime = time;
                gameState.lastShootTime = time;
              }
            });
          }
        });
      }
    });
  }
}