export function setupUI(scene) {
  scene.ui = {
    background: scene.add.rectangle(85, 55, 150, 90, 0x000000, 0.5).setOrigin(0.5).setDepth(1),
    keyText: scene.add.text(10, 10, 'Key: No', { fontSize: '16px', fill: '#FFF' }).setDepth(2),
    healthBar: scene.add.graphics().setDepth(2),
    chargeBar: scene.add.graphics().setDepth(2),
    armorBar: scene.add.graphics().setDepth(2),
    bossHealthBar: scene.add.graphics().setDepth(2),
    tripleShotTimerText: scene.add.text(10, 75, '', { fontSize: '12px', fill: '#FFD700' }).setDepth(2),
    speedBoostTimerText: scene.add.text(60, 75, '', { fontSize: '12px', fill: '#00FFFF' }).setDepth(2),
    slowShotTimerText: scene.add.text(110, 75, '', { fontSize: '12px', fill: '#FF00FF' }).setDepth(2),
    killsText: scene.add.text(940, 10, '0', { fontSize: '24px', fill: '#FF0000' }).setOrigin(1, 0).setDepth(2)
  };

  scene.tweens.add({
    targets: scene.ui.healthBar,
    alpha: { from: 0.8, to: 1 },
    duration: 1000,
    yoyo: true,
    repeat: -1
  });
  scene.tweens.add({
    targets: scene.ui.chargeBar,
    alpha: { from: 0.8, to: 1 },
    duration: 1000,
    yoyo: true,
    repeat: -1
  });
  scene.tweens.add({
    targets: scene.ui.armorBar,
    alpha: { from: 0.8, to: 1 },
    duration: 1000,
    yoyo: true,
    repeat: -1
  });
  scene.tweens.add({
    targets: scene.ui.bossHealthBar,
    alpha: { from: 0.8, to: 1 },
    duration: 1000,
    yoyo: true,
    repeat: -1
  });
}

export function updateUI(scene) {
  const { ui, gameState } = scene;
  ui.keyText.setText(`Key: ${gameState.hasKey ? 'Yes' : 'No'}`);
  
  ui.healthBar.clear()
    .fillStyle(0x555555, 1).fillRect(60, 25, 100, 10)
    .fillStyle(0xff0000, 1).fillRect(60, 25, (gameState.playerHealth / 100) * 100, 10);
  
  ui.chargeBar.clear()
    .fillStyle(0x555555, 1).fillRect(60, 40, 100, 10)
    .fillStyle(0x00ff00, 1).fillRect(60, 40, (gameState.chargeLevel / 1000) * 100, 10);
  
  ui.armorBar.clear()
    .fillStyle(0x555555, 1).fillRect(60, 55, 100, 10)
    .fillStyle(0x0000ff, 1).fillRect(60, 55, (gameState.shieldHP / 3) * 100, 10);
  
  ui.tripleShotTimerText.setText(gameState.tripleShotTimer > 0 ? `Triple: ${Math.ceil(gameState.tripleShotTimer / 1000)}s` : '');
  ui.speedBoostTimerText.setText(gameState.speedBoostTimer > 0 ? `Speed: ${Math.ceil(gameState.speedBoostTimer / 1000)}s` : '');
  ui.slowShotTimerText.setText(gameState.slowShotTimer > 0 ? `Slow: ${Math.ceil(gameState.slowShotTimer / 1000)}s` : '');
  
  ui.killsText.setText(`${gameState.consecutiveKills}`);
}