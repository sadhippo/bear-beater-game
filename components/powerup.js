export class PowerUps {
    
    static spawnPowerUp(scene) {
        if (!scene.gameActive) return;
    
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.min(scene.screenWidth, scene.screenHeight) / 2;
        const x = scene.screenWidth / 2 + Math.cos(angle) * radius;
        const y = scene.screenHeight / 2 + Math.sin(angle) * radius;
        
        const powerUpType = Phaser.Math.RND.pick(['speed', 'purple', 'spread', 'rapid', 'shield', 'magnet', 'multishot', 'freeze', 'triangle']);
        const powerUp = scene.powerUps.create(x, y, 'powerup');
        powerUp.setScale(0.5 * scene.scaleFactor);
        powerUp.setData('type', powerUpType);
    
        // Set different colors for each power-up type
        const colors = {
            speed: 0xffff00,
            purple: 0x800080,
            spread: 0x00ff00,
            rapid: 0xff0000,
            shield: 0x0000ff,
            magnet: 0xff00ff,
            multishot: 0xffa500,
            freeze: 0x00ffff,
            triangle: 0x8B4513 // Brown color for triangle power-up
        };
        powerUp.setTint(colors[powerUpType]);
    
        scene.tweens.add({
            targets: powerUp,
            scale: powerUp.scale * 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    static collectPowerUp(scene, player, powerUp) {
        if (!powerUp || !powerUp.active) return;

        const powerUpType = powerUp.getData('type');
        if (!powerUpType) {
            powerUp.destroy();
            return;
        }

        powerUp.destroy();
        this.applyPowerUpEffect(scene, powerUpType);
        scene.time.delayedCall(1000, () => this.spawnPowerUp(scene), [], scene);
    }

    static applyPowerUpEffect(scene, powerUpType) {
    const duration = 10000;

    if (scene.activePowerUps.has(powerUpType)) {
        if (scene.powerUpTimers[powerUpType]) {
            scene.powerUpTimers[powerUpType].remove();
        }
    } else {
        scene.activePowerUps.add(powerUpType);
    }

    switch (powerUpType) {
        case 'rapid':
            scene.player.fireRate *= 0.5; // Double fire rate
            break;
        case 'shield':
            scene.player.setTint(0x0000ff);
            scene.player.isInvincible = true;
            break;
        case 'magnet':
            scene.player.magnetRange = 200 * scene.scaleFactor;
            break;
        case 'multishot':
            scene.player.multishot = true;
            break;
        case 'freeze':
            scene.bears.getChildren().forEach(bear => {
                bear.setTint(0x00ffff);
                bear.freezeSpeed = bear.speed;
                bear.speed *= 0.5; // Slow down bears
            });
            break;
        case 'triangle':
               
            break;    
        // Existing power-ups...
    }

    scene.powerUpTimers[powerUpType] = scene.time.delayedCall(duration, () => {
        this.removePowerUpEffect(scene, powerUpType);
    }, [], scene);

    this.updatePowerUpUI(scene, powerUpType, true);
}

static removePowerUpEffect(scene, powerUpType) {
    scene.activePowerUps.delete(powerUpType);
    delete scene.powerUpTimers[powerUpType];

    switch (powerUpType) {
        case 'rapid':
            scene.player.fireRate *= 2; // Reset fire rate
            break;
        case 'shield':
            scene.player.clearTint();
            scene.player.isInvincible = false;
            break;
        case 'magnet':
            scene.player.magnetRange = 0;
            break;
        case 'multishot':
            scene.player.multishot = false;
            break;
        case 'freeze':
            scene.bears.getChildren().forEach(bear => {
                bear.clearTint();
                bear.speed = bear.freezeSpeed;
                delete bear.freezeSpeed;
            });
            break;
            case 'triangle':
            // No specific removal effect needed
            break;
        // Handle existing power-ups...
    }

    this.updatePowerUpUI(scene, powerUpType, false);
}

    static updatePowerUpUI(scene, powerUpType, isActive) {
        if (scene.powerUpTexts && scene.powerUpTexts[powerUpType]) {
            scene.powerUpTexts[powerUpType].setVisible(isActive);
        }
        if (scene.powerUpBars && scene.powerUpBars[powerUpType]) {
            scene.powerUpBars[powerUpType].setVisible(isActive);
        }
    }

    static createPurpleProjectile(scene) {
        if (!scene.textures.exists('purpleProjectile')) {
            const graphics = scene.add.graphics();
            graphics.fillStyle(0x800080, 1);
            graphics.fillCircle(5, 5, 5 * scene.scaleFactor);
            graphics.generateTexture('purpleProjectile', 10 * scene.scaleFactor, 10 * scene.scaleFactor);
            graphics.destroy();
        }
    }
}