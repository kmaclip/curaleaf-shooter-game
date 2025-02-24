export function setupPlayer(scene) {
  const player = scene.physics.add.sprite(480, 288, 'curaleaf').setScale(0.15);
  player.gridX = 10;
  player.gridY = 6;
  player.setCollideWorldBounds(true);

  scene.cursors = scene.input.keyboard.createCursorKeys();
  scene.xbiteKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

  scene.player = player;
  scene.player.shootNugget = () => {
    const pointer = scene.input.activePointer;
    const angle = Phaser.Math.Angle.Between(player.x, player.y, pointer.x, pointer.y);
    if (scene.gameState.tripleShotTimer > 0) {
      const offsets = [-0.2, 0, 0.2];
      offsets.forEach(offset => {
        const bullet = scene.bullets.get(player.x, player.y);
        if (bullet) {
          bullet.setActive(true).setVisible(true);
          scene.physics.velocityFromRotation(angle + offset, 300, bullet.body.velocity);
          bullet.setScale(0.1).rotation = angle + offset;
          if (scene.gameState.slowShotTimer > 0) bullet.slowsEnemies = true;
          bullet.damage = 11;
        }
      });
    } else {
      const bullet = scene.bullets.get(player.x, player.y);
      if (bullet) {
        bullet.setActive(true).setVisible(true);
        scene.physics.velocityFromRotation(angle, 300, bullet.body.velocity);
        bullet.setScale(0.1).rotation = angle;
        if (scene.gameState.slowShotTimer > 0) bullet.slowsEnemies = true;
        bullet.damage = 11;
      }
    }
  };

  return player;
}

export function updatePlayer(scene, time, delta) {
  const { cursors, gameState, player } = scene;
  const MOVEMENT_COOLDOWN = 200;

  if (gameState.lastMoveTime === undefined) gameState.lastMoveTime = 0;
  if (time - gameState.lastMoveTime < MOVEMENT_COOLDOWN) return;

  if (!scene.dungeonGrid) {
    console.error('dungeonGrid is undefined in updatePlayer');
    return;
  }

  const canMove = (newX, newY) => {
    const tile = scene.dungeonGrid[newY][newX];
    const isCollidable = [1, 2, 7, 12, 13, 14, 15, 16, 17, 18].includes(tile);
    return !isCollidable && newX >= 0 && newX < 20 && newY >= 0 && newY < 12;
  };

  let moved = false;
  let newGridX = player.gridX;
  let newGridY = player.gridY;

  player.body.velocity.set(0);

  const currentTile = scene.dungeonGrid[player.gridY][player.gridX];
  if (currentTile === 9) {
    if (canMove(player.gridX + 1, player.gridY)) {
      newGridX = player.gridX + 1;
      moved = true;
      scene.physics.velocityFromRotation(0, 50, player.body.velocity);
    }
  } else if (currentTile === 10) {
    if (canMove(player.gridX - 1, player.gridY)) {
      newGridX = player.gridX - 1;
      moved = true;
      scene.physics.velocityFromRotation(Math.PI, 50, player.body.velocity);
    }
  }

  const speed = gameState.speedBoostTimer > 0 ? 150 : 100;
  if (cursors.left.isDown && canMove(player.gridX - 1, player.gridY)) {
    newGridX--;
    moved = true;
    scene.physics.velocityFromRotation(Math.PI, speed, player.body.velocity);
  } else if (cursors.right.isDown && canMove(player.gridX + 1, player.gridY)) {
    newGridX++;
    moved = true;
    scene.physics.velocityFromRotation(0, speed, player.body.velocity);
  } else if (cursors.up.isDown && canMove(player.gridX, player.gridY - 1)) {
    newGridY--;
    moved = true;
    scene.physics.velocityFromRotation(-Math.PI / 2, speed, player.body.velocity);
  } else if (cursors.down.isDown && canMove(player.gridX, player.gridY + 1)) {
    newGridY++;
    moved = true;
    scene.physics.velocityFromRotation(Math.PI / 2, speed, player.body.velocity);
  }

  if (moved) {
    scene.tweens.add({
      targets: player,
      x: newGridX * 48,
      y: newGridY * 48,
      duration: 100,
      ease: 'Linear',
      onComplete: () => {
        player.gridX = newGridX;
        player.gridY = newGridY;
        player.x = player.gridX * 48;
        player.y = player.gridY * 48;
        const tile = scene.dungeonGrid[player.gridY][player.gridX];

        if (tile === 5 || tile === 8) {
          gameState.playerHealth -= 20;
          scene.add.text(player.x, player.y - 20, '-20 HP!', { fontSize: '16px', fill: '#FF0000' })
            .setOrigin(0.5).setDepth(10).destroy(500);
          if (gameState.playerHealth <= 0) {
            scene.physics.world.isPaused = true;
            scene.gameOver = true;
          }
        } else if (tile === 6) {
          gameState.score += 50;
          scene.dungeonGrid[player.gridY][player.gridX] = 0;
          scene.dungeonTexts[player.gridY * 20 + player.gridX].setText('.').setFill('#666');
          scene.add.text(player.x, player.y - 20, '+50 Score!', { fontSize: '16px', fill: '#FFD700' })
            .setOrigin(0.5).setDepth(10).destroy(500);
        } else if (tile === 19) { // Preroll (shield)
          gameState.shieldHP = 3;
          if (!scene.shieldSprite) {
            scene.shieldSprite = scene.add.image(player.x, player.y, 'preroll').setScale(0.2).setDepth(1);
            scene.shieldSprite.setOrigin(0.5);
          }
          scene.dungeonGrid[player.gridY][player.gridX] = 0;
          scene.dungeonTexts[player.gridY * 20 + player.gridX].setText('.').setFill('#666');
          const pickupSprite = scene.powerUpSprites.find(s => s.gridX === player.gridX && s.gridY === player.gridY);
          if (pickupSprite) {
            pickupSprite.destroy();
            scene.powerUpSprites = scene.powerUpSprites.filter(s => s !== pickupSprite);
          }
        } else if (tile === 20) { // Rosin (triple shot)
          gameState.tripleShotTimer = 30000;
          scene.dungeonGrid[player.gridY][player.gridX] = 0;
          scene.dungeonTexts[player.gridY * 20 + player.gridX].setText('.').setFill('#666');
          const rosinSprite = scene.powerUpSprites.find(s => s.gridX === player.gridX && s.gridY === player.gridY);
          if (rosinSprite) {
            rosinSprite.destroy();
            scene.powerUpSprites = scene.powerUpSprites.filter(s => s !== rosinSprite);
          }
        } else if (tile === 21) { // Tincture (speed boost)
          gameState.speedBoostTimer = 30000;
          scene.dungeonGrid[player.gridY][player.gridX] = 0;
          scene.dungeonTexts[player.gridY * 20 + player.gridX].setText('.').setFill('#666');
          const tinctureSprite = scene.powerUpSprites.find(s => s.gridX === player.gridX && s.gridY === player.gridY);
          if (tinctureSprite) {
            tinctureSprite.destroy();
            scene.powerUpSprites = scene.powerUpSprites.filter(s => s !== tinctureSprite);
          }
        } else if (tile === 22) { // RSO Capsule (slow shot)
          gameState.slowShotTimer = 30000;
          scene.dungeonGrid[player.gridY][player.gridX] = 0;
          scene.dungeonTexts[player.gridY * 20 + player.gridX].setText('.').setFill('#666');
          const rsoSprite = scene.powerUpSprites.find(s => s.gridX === player.gridX && s.gridY === player.gridY);
          if (rsoSprite) {
            rsoSprite.destroy();
            scene.powerUpSprites = scene.powerUpSprites.filter(s => s !== rsoSprite);
          }
        } else if (tile === 23) { // Squeeze (health boost)
          gameState.playerHealth = Math.min(gameState.playerHealth + 25, 100);
          scene.dungeonGrid[player.gridY][player.gridX] = 0;
          scene.dungeonTexts[player.gridY * 20 + player.gridX].setText('.').setFill('#666');
          const squeezeSprite = scene.powerUpSprites.find(s => s.gridX === player.gridX && s.gridY === player.gridY);
          if (squeezeSprite) {
            squeezeSprite.destroy();
            scene.powerUpSprites = scene.powerUpSprites.filter(s => s !== squeezeSprite);
          }
          scene.add.text(player.x, player.y - 20, '+25 HP!', { fontSize: '16px', fill: '#00FF00' })
            .setOrigin(0.5).setDepth(10).destroy(500);
        }
      }
    });
    gameState.lastMoveTime = time;
  }

  if (scene.key && scene.physics.overlap(player, scene.key)) {
    gameState.hasKey = true;
    scene.key.destroy();
    scene.key = null;
    scene.add.text(480, 300, 'KEY GET!', { fontSize: '32px', fill: '#FFF' })
      .setOrigin(0.5).setDepth(10).destroy(1000);
  }

  if (gameState.shieldHP > 0) {
    if (!scene.shieldSprite) {
      scene.shieldSprite = scene.add.image(player.x, player.y, 'preroll').setScale(0.2).setDepth(1);
      scene.shieldSprite.setOrigin(0.5);
    }
    const radius = 30;
    const angleSpeed = 0.005;
    if (!player.shieldAngle) player.shieldAngle = 0;
    player.shieldAngle += angleSpeed * delta;
    scene.shieldSprite.x = player.x + Math.cos(player.shieldAngle) * radius;
    scene.shieldSprite.y = player.y + Math.sin(player.shieldAngle) * radius;
  } else if (scene.shieldSprite) {
    scene.shieldSprite.destroy();
    scene.shieldSprite = null;
  }

  scene.enemies.children.each(enemy => {
    if (enemy && enemy.active && scene.physics.overlap(player, enemy)) {
      if (gameState.shieldHP > 0) {
        gameState.shieldHP--;
        enemy.destroy();
        if (gameState.shieldHP === 0 && scene.shieldSprite) {
          scene.shieldSprite.destroy();
          scene.shieldSprite = null;
        }
      } else {
        enemy.destroy();
        gameState.playerHealth -= 10;
        if (gameState.playerHealth <= 0) {
          scene.physics.world.isPaused = true;
          scene.gameOver = true;
        }
      }
    }
  });

  if (Phaser.Input.Keyboard.JustDown(scene.xbiteKey) && gameState.chargeLevel >= 1000) {
    scene.enemies.clear(true, true);
    scene.enemyProjectiles.clear(true, true);
    gameState.chargeLevel = 0;
    scene.add.text(480, 300, 'XBITE NUKE!', { fontSize: '32px', fill: '#FFF' })
      .setOrigin(0.5).destroy(1500);
  }
}