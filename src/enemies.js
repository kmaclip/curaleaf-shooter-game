export function setupEnemies(scene) {
  scene.bullets = scene.physics.add.group({ defaultKey: 'nugget', maxSize: 5 });
  scene.enemies = scene.physics.add.group({ maxSize: 20 });
  scene.enemyProjectiles = scene.physics.add.group({ defaultKey: 'ground', maxSize: 10 });

  scene.physics.add.overlap(scene.bullets, scene.enemies, (bullet, enemy) => {
    bullet.destroy();
    if (enemy.texture.key === 'cookies' && scene.gameState.enemyShields[enemy.id]) {
      scene.gameState.enemyShields[enemy.id] = false;
      if (enemy.shieldSprite) {
        enemy.shieldSprite.destroy();
        enemy.shieldSprite = null;
      }
      enemy.shieldRegenTime = scene.time.now + 10000;
    } else {
      enemy.health -= bullet.damage || 11;
      if (bullet.slowsEnemies && !enemy.isSlowed) {
        enemy.originalSpeed = enemy.speed || 100;
        enemy.speed = enemy.originalSpeed * 0.5;
        enemy.isSlowed = true;
        scene.time.delayedCall(5000, () => {
          if (enemy.active) {
            enemy.speed = enemy.originalSpeed;
            enemy.isSlowed = false;
          }
        });
      }
      if (enemy.health <= 0) {
        enemy.destroy();
        scene.gameState.score += (enemy.behavior === 'trulieve_boss' ? 100 : 10);
        scene.gameState.chargeLevel = Math.min(scene.gameState.chargeLevel + (enemy.behavior === 'trulieve_boss' ? 500 : 100), 1000);
        scene.gameState.consecutiveKills++;
        if (enemy.behavior === 'trulieve_boss') {
          scene.ui.bossHealthBar.clear();
        }
      } else if (enemy.behavior === 'trulieve_boss') {
        scene.ui.bossHealthBar.clear()
          .fillStyle(0x555555, 1).fillRect(380, 10, 200, 20)
          .fillStyle(0xff0000, 1).fillRect(380, 10, (enemy.health / 200) * 200, 20);
      }
    }
  });

  scene.physics.add.overlap(scene.player, scene.enemies, (player, enemy) => {
    if (enemy.texture.key === 'cookies' && scene.gameState.enemyShields[enemy.id]) {
      scene.gameState.enemyShields[enemy.id] = false;
      if (enemy.shieldSprite) {
        enemy.shieldSprite.destroy();
        enemy.shieldSprite = null;
      }
      enemy.shieldRegenTime = scene.time.now + 10000;
    } else {
      enemy.destroy();
      if (scene.gameState.shieldHP > 0) {
        scene.gameState.shieldHP--;
        if (scene.gameState.shieldHP === 0 && scene.shieldSprite) {
          scene.shieldSprite.destroy();
          scene.shieldSprite = null;
        }
      } else {
        scene.gameState.playerHealth -= enemy.damage;
        if (scene.gameState.playerHealth <= 0) {
          scene.physics.world.isPaused = true;
          scene.gameOver = true;
        }
      }
    }
  });

  scene.physics.add.overlap(scene.player, scene.enemyProjectiles, (player, projectile) => {
    projectile.destroy();
    if (scene.gameState.shieldHP > 0) {
      scene.gameState.shieldHP--;
      if (scene.gameState.shieldHP === 0 && scene.shieldSprite) {
        scene.shieldSprite.destroy();
        scene.shieldSprite = null;
      }
    } else {
      scene.gameState.playerHealth -= 15;
      if (scene.gameState.playerHealth <= 0) {
        scene.physics.world.isPaused = true;
        scene.gameOver = true;
      }
    }
  });
}

export function spawnEnemy() {
  const { enemies, gameState, dungeonGrid } = this;

  const roomKey = `${gameState.currentRoom.x},${gameState.currentRoom.y}`;
  if (!gameState.roomEnemies) gameState.roomEnemies = {};
  if (!gameState.roomEnemies[roomKey]) gameState.roomEnemies[roomKey] = [];

  const roomEnemies = gameState.roomEnemies[roomKey];
  if (gameState.isBossRoom) return;
  if (roomEnemies.length >= 12) return;

  const gridX = Phaser.Math.Between(2, 18);
  const gridY = Phaser.Math.Between(2, 10);
  if (!dungeonGrid) {
    console.error('dungeonGrid undefined in spawnEnemy');
    return;
  }
  const tile = dungeonGrid[gridY][gridX];
  if ([1, 2, 7, 12, 13, 14, 16, 17, 18].includes(tile)) {
    console.log(`Enemy spawn blocked at (${gridX}, ${gridY}) - collides`);
    return;
  }

  let enemyType, enemyCount = 1;
  const roomType = Phaser.Math.Between(0, 3);

  if (roomType === 0 || roomType === 1) {
    const simpleEnemy = Phaser.Math.Between(0, 1) === 0 ? 'ayr' : 'fluent';
    enemyType = simpleEnemy;
    if (Phaser.Math.Between(0, 2) === 0) {
      enemyType = 'flowery';
    }
  } else {
    if (Phaser.Math.Between(0, 1) === 0) {
      enemyType = Phaser.Math.Between(0, 1) === 0 ? 'muv' : 'trulieve';
      if (enemyType === 'trulieve') enemyCount = Phaser.Math.Between(2, 4);
    } else if (Phaser.Math.Between(0, 3) === 0) {
      enemyType = 'cookies';
    }
  }

  for (let i = 0; i < enemyCount; i++) {
    const spawnX = gridX + Phaser.Math.Between(-1, 1);
    const spawnY = gridY + Phaser.Math.Between(-1, 1);
    if (spawnX >= 2 && spawnX <= 18 && spawnY >= 2 && spawnY <= 10 && dungeonGrid[spawnY][spawnX] === 0) {
      const enemy = enemies.create(spawnX * 48, spawnY * 48, enemyType)
        .setScale(enemyType === 'muv' ? 0.125 : enemyType === 'cookies' ? 0.1875 : 0.25);
      if (enemyType === 'cookies') {
        enemy.shieldSprite = this.add.image(enemy.x, enemy.y, 'chocolate').setScale(0.2).setDepth(1);
        enemy.shieldSprite.setOrigin(0.5);
        gameState.enemyShields[enemy.id] = true;
      }
      configureEnemyBehavior(this, enemy, enemyType);
      roomEnemies.push(enemy);
      console.log(`Enemy ${enemyType} spawned at (${spawnX}, ${spawnY}) with scale ${enemy.scaleX}`);
    }
  }
}

export function configureEnemyBehavior(scene, enemy, type) {
  enemy.behavior = type;
  enemy.health = { 'ayr': 20, 'fluent': 20, 'flowery': 30, 'muv': 25, 'trulieve': 15, 'cookies': 40, 'trulieve_boss': 200 }[type];
  enemy.damage = { 'ayr': 10, 'fluent': 10, 'flowery': 12, 'muv': 15, 'trulieve': 5, 'cookies': 10, 'trulieve_boss': 20 }[type];
  enemy.speed = { 'ayr': 100, 'fluent': 100, 'flowery': 50, 'muv': -30, 'trulieve': 70, 'cookies': 100, 'trulieve_boss': 80 }[type];

  if (type === 'ayr' || type === 'fluent') {
    enemy.update = function (delta) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y);
      scene.physics.velocityFromRotation(angle, this.speed || 100, this.body.velocity);
      this.x = Phaser.Math.Clamp(this.x, 48, 912);
      this.y = Phaser.Math.Clamp(this.y, 48, 552);
    };
  } else if (type === 'flowery') {
    enemy.state = 'chase';
    enemy.stateTimer = 0;
    enemy.update = function (delta) {
      this.stateTimer -= delta;
      if (this.stateTimer <= 0) {
        const roll = Phaser.Math.Between(0, 100);
        if (roll < 20) this.state = 'pause';
        else if (roll < 40) this.state = 'retreat';
        else this.state = 'chase';
        this.stateTimer = Phaser.Math.Between(1000, 3000);
      }

      if (this.state === 'pause') {
        this.body.velocity.set(0);
      } else if (this.state === 'retreat') {
        const angle = Phaser.Math.Angle.Between(scene.player.x, scene.player.y, this.x, this.y);
        scene.physics.velocityFromRotation(angle, this.speed || 50, this.body.velocity);
      } else {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, scene.player.x, scene.player.y);
        if (distance < 300) {
          const angle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y);
          scene.physics.velocityFromRotation(angle, this.speed || 50, this.body.velocity);
        } else if (!this.lastDirection || Phaser.Math.Between(0, 100) < 10) {
          this.lastDirection = { x: Phaser.Math.Between(-1, 1) * 50, y: Phaser.Math.Between(-1, 1) * 50 };
          this.body.velocity.set(this.lastDirection.x, this.lastDirection.y);
        }
      }
      this.x = Phaser.Math.Clamp(this.x, 48, 912);
      this.y = Phaser.Math.Clamp(this.y, 48, 552);
    };
  } else if (type === 'muv') {
    enemy.update = function (delta) {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, scene.player.x, scene.player.y);
      if (distance > 200) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y);
        scene.physics.velocityFromRotation(angle, this.speed || -30, this.body.velocity);
      } else {
        this.body.velocity.set(0);
      }

      scene.bullets.children.each(bullet => {
        if (bullet.active && Phaser.Math.Distance.Between(this.x, this.y, bullet.x, bullet.y) < 100 && Phaser.Math.Between(0, 100) < 10) {
          const dodgeAngle = Phaser.Math.Angle.Between(bullet.x, bullet.y, this.x, this.y) + Math.PI / 2;
          scene.physics.velocityFromRotation(dodgeAngle, 100, this.body.velocity);
          this.dodgeTimer = 500;
        }
      });
      if (this.dodgeTimer) {
        this.dodgeTimer -= delta;
        if (this.dodgeTimer <= 0) this.body.velocity.set(0);
      }

      if (!this.lastShot) this.lastShot = 0;
      if (scene.time.now - this.lastShot > 2000) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y);
        const projectile = scene.enemyProjectiles.get(this.x, this.y);
        if (projectile) {
          projectile.setActive(true).setVisible(true);
          scene.physics.velocityFromRotation(angle, 100, projectile.body.velocity);
          projectile.setScale(0.1);
        }
        this.lastShot = scene.time.now;
      }
      this.x = Phaser.Math.Clamp(this.x, 48, 912);
      this.y = Phaser.Math.Clamp(this.y, 48, 552);
    };
  } else if (type === 'trulieve') {
    enemy.update = function (delta) {
      const leader = scene.enemies.children.entries.find(e => e.active && e.behavior === 'trulieve' && e !== this);
      if (leader && Phaser.Math.Distance.Between(this.x, this.y, leader.x, leader.y) > 100) {
        const angleToLeader = Phaser.Math.Angle.Between(this.x, this.y, leader.x, leader.y);
        scene.physics.velocityFromRotation(angleToLeader, this.speed || 70, this.body.velocity);
      } else {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y);
        const offset = leader ? Phaser.Math.Between(-20, 20) : 0;
        scene.physics.velocityFromRotation(angle + Phaser.Math.DegToRad(offset), this.speed || 70, this.body.velocity);
      }
      this.x = Phaser.Math.Clamp(this.x, 48, 912);
      this.y = Phaser.Math.Clamp(this.y, 48, 552);
    };
  } else if (type === 'cookies') {
    enemy.update = function (delta) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y);
      scene.physics.velocityFromRotation(angle, this.speed || 100, this.body.velocity);
      this.x = Phaser.Math.Clamp(this.x, 48, 912);
      this.y = Phaser.Math.Clamp(this.y, 48, 552);

      if (scene.gameState.enemyShields[this.id]) {
        if (!this.shieldSprite) {
          this.shieldSprite = scene.add.image(this.x, this.y, 'chocolate').setScale(0.2).setDepth(1);
          this.shieldSprite.setOrigin(0.5);
        }
        const radius = 30;
        const angleSpeed = 0.005;
        if (!this.shieldAngle) this.shieldAngle = 0;
        this.shieldAngle += angleSpeed * delta;
        this.shieldSprite.x = this.x + Math.cos(this.shieldAngle) * radius;
        this.shieldSprite.y = this.y + Math.sin(this.shieldAngle) * radius;
      } else if (this.shieldSprite && !scene.gameState.enemyShields[this.id]) {
        this.shieldSprite.destroy();
        this.shieldSprite = null;
        if (this.shieldRegenTime && scene.time.now > this.shieldRegenTime) {
          this.shieldSprite = scene.add.image(this.x, this.y, 'chocolate').setScale(0.2).setDepth(1);
          this.shieldSprite.setOrigin(0.5);
          scene.gameState.enemyShields[this.id] = true;
          this.shieldRegenTime = null;
        }
      }
    };
  } else if (type === 'trulieve_boss') {
    enemy.update = function (delta) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y);
      if (!this.state) this.state = 'chase';
      if (!this.stateTimer) this.stateTimer = 0;

      this.stateTimer -= delta;
      if (this.stateTimer <= 0) {
        this.state = Phaser.Math.Between(0, 1) === 0 ? 'chase' : 'pause';
        this.stateTimer = Phaser.Math.Between(2000, 4000);
      }

      if (this.state === 'chase') {
        scene.physics.velocityFromRotation(angle, this.speed || 80, this.body.velocity);
      } else {
        this.body.velocity.set(0);
      }
      this.x = Phaser.Math.Clamp(this.x, 48, 912);
      this.y = Phaser.Math.Clamp(this.y, 48, 552);

      if (!this.lastSpawn) this.lastSpawn = 0;
      if (scene.time.now - this.lastSpawn > 5000 && scene.gameState.roomEnemies[`${scene.gameState.currentRoom.x},${scene.gameState.currentRoom.y}`].length < 20) {
        const minionCount = Phaser.Math.Between(5, 7);
        for (let i = 0; i < minionCount; i++) {
          const spawnX = Phaser.Math.Between(2, 18);
          const spawnY = Phaser.Math.Between(2, 10);
          if (spawnX >= 2 && spawnX <= 18 && spawnY >= 2 && spawnY <= 10 && scene.dungeonGrid[spawnY][spawnX] === 0) {
            const minion = scene.enemies.create(spawnX * 48, spawnY * 48, 'trulieve')
              .setScale(0.25);
            minion.health = 15;
            minion.damage = 5;
            minion.speed = 100;
            minion.behavior = 'trulieve_minion';
            minion.update = function (delta) {
              const angle = Phaser.Math.Angle.Between(this.x, this.y, scene.player.x, scene.player.y);
              const offset = Phaser.Math.Between(-30, 30);
              scene.physics.velocityFromRotation(angle + Phaser.Math.DegToRad(offset), this.speed || 100, this.body.velocity);
              this.x = Phaser.Math.Clamp(this.x, 48, 912);
              this.y = Phaser.Math.Clamp(this.y, 48, 552);
            };
            scene.gameState.roomEnemies[`${scene.gameState.currentRoom.x},${scene.gameState.currentRoom.y}`].push(minion);
          }
        }
        this.lastSpawn = scene.time.now;
      }

      if (!this.lastShot) this.lastShot = 0;
      if (scene.time.now - this.lastShot > 3000) {
        const angles = [angle - 0.3, angle, angle + 0.3];
        angles.forEach(spreadAngle => {
          const projectile = scene.enemyProjectiles.get(this.x, this.y);
          if (projectile) {
            projectile.setActive(true).setVisible(true);
            scene.physics.velocityFromRotation(spreadAngle, 150, projectile.body.velocity);
            projectile.setScale(0.15);
          }
        });
        this.lastShot = scene.time.now;
      }

      scene.ui.bossHealthBar.clear()
        .fillStyle(0x555555, 1).fillRect(380, 10, 200, 20)
        .fillStyle(0xff0000, 1).fillRect(380, 10, (this.health / 200) * 200, 20);
    };

    if (!this.squeezeSpawned && Phaser.Math.Between(0, 3) === 0) {
      const spawnX = Phaser.Math.Between(2, 18);
      const spawnY = Phaser.Math.Between(2, 10);
      if (spawnX >= 2 && spawnX <= 18 && spawnY >= 2 && spawnY <= 10 && scene.dungeonGrid[spawnY][spawnX] === 0) {
        scene.dungeonGrid[spawnY][spawnX] = 23;
        const squeeze = scene.add.sprite(spawnX * 48 + 24, spawnY * 48 + 24, 'squeeze').setScale(0.2).setDepth(2);
        squeeze.gridX = spawnX;
        squeeze.gridY = spawnY;
        scene.powerUpSprites.push(squeeze);
        this.squeezeSpawned = true;
      }
    }
  }
}

export function updateEnemies(scene, delta) {
  scene.enemies.children.each(enemy => {
    if (enemy && enemy.active && enemy.update) {
      enemy.update(delta);
    }
  });

  scene.enemyProjectiles.children.each(projectile => {
    if (projectile && projectile.active) {
      if (scene.physics.overlap(projectile, scene.player)) {
        projectile.destroy();
        if (scene.gameState.shieldHP > 0) {
          scene.gameState.shieldHP--;
          if (scene.gameState.shieldHP === 0 && scene.shieldSprite) {
            scene.shieldSprite.destroy();
            scene.shieldSprite = null;
          }
        } else {
          scene.gameState.playerHealth -= 15;
          if (scene.gameState.playerHealth <= 0) {
            scene.physics.world.isPaused = true;
            scene.gameOver = true;
          }
        }
      }
    }
  });

  [scene.bullets, scene.enemies, scene.enemyProjectiles].forEach(group =>
    group.children.iterate(child => {
      if (child && (!child.active || child.x < 0 || child.x > 960 || child.y < 0 || child.y > 600)) {
        child.destroy();
      }
    })
  );
}