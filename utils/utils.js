
import PlayerManager from '../managers/PlayerManager.js';

export class Utils {


   static baseSpawnRate = 1000; // Initial spawn delay in milliseconds
   static minSpawnRate = 200;   // Minimum spawn delay
   static spawnTimer = null;    // To store the spawn timer


   static shootProjectiles(scene, player) {
        let baseProjectiles = 10;
        let baseSpeed = 300 * scene.scaleFactor;
        let baseFireRate = 100; // ms between shots

        let numProjectiles = baseProjectiles;
        let projectileSpeed = baseSpeed;
        let fireRate = baseFireRate;

        // Apply power-up effects
        if (scene.activePowerUps.has('spread')) {
            numProjectiles = Math.floor(baseProjectiles * 2);
        }
        if (scene.activePowerUps.has('speed')) {
            projectileSpeed *= 2;
        }
        if (scene.activePowerUps.has('rapid')) {
            fireRate *= 0.5; // Double fire rate
        }
        if (scene.activePowerUps.has('multishot')) {
            numProjectiles = Math.max(numProjectiles, 16); // Ensure at least 16 projectiles for multishot
        }

        // Check if enough time has passed since last shot
        const currentTime = scene.time.now;
        if (currentTime - player.lastShotTime < fireRate) {
            return; // Exit if not enough time has passed
        }
        player.lastShotTime = currentTime;

        const angleStep = (Math.PI * 2) / numProjectiles;

        for (let i = 0; i < numProjectiles; i++) {
            const angle = i * angleStep;
            const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
            velocity.scale(projectileSpeed);

            let bulletTexture = 'whiteProjectile';
            if (scene.activePowerUps.has('purple')) {
                bulletTexture = 'purpleProjectile';
            } else if (scene.activePowerUps.has('triangle')) {
                bulletTexture = 'triangleProjectile';
            }
            const bullet = scene.bullets.get(player.x, player.y, bulletTexture);
            if (bullet) {
                bullet.setActive(true).setVisible(true);
                bullet.setScale(scene.scaleFactor);
                bullet.setTexture(bulletTexture);
                bullet.body.velocity.copy(velocity);

                if (bulletTexture === 'triangleProjectile') {
                    bullet.setRotation(angle + Math.PI / 2);
                }
                
                scene.time.delayedCall(2000, () => {
                    if (bullet.active) {
                        bullet.setActive(false).setVisible(false);
                        scene.bullets.killAndHide(bullet);
                    }
                }, [], scene);
            }
        }
    } 

static hitBearWithBullet(scene, bullet, bear) {
    this.bearDeath(scene, bear);

    bullet.setActive(false).setVisible(false);
    scene.bullets.killAndHide(bullet);
    const baseScore = 20;
    const playerManager = PlayerManager.getInstance();
    const multiplier = playerManager.getUpgradeEffect('basicMultiplier');
    const scoreGained = Math.floor(baseScore * multiplier);
        
    scene.score += scoreGained;
    scene.showFloatingText(bear.x, bear.y, `+${scoreGained}`);
    scene.scoreText.setText('Score: ' + scene.score);

    this.checkBearSpawn(scene);
    }

    static hitBear(scene, player, bear) {
        this.bearDeath(scene, bear);
        
        const baseScore = 10;
        const playerManager = PlayerManager.getInstance();
        const multiplier = playerManager.getUpgradeEffect('basicMultiplier');
        const scoreGained = Math.floor(baseScore * multiplier);
        
        scene.score += scoreGained;
        scene.showFloatingText(bear.x, bear.y, `+${scoreGained}`);
    
        scene.scoreText.setText('Score: ' + scene.score);
        player.takeDamage(5); // Assuming you've implemented this method in the Player class
    
        this.checkBearSpawn(scene);
    }

    static bearDeath(scene, bear) {
        bear.setTint(0xff0000);  // Sets the tint to red

        scene.tweens.add({
            targets: bear,
            alpha: 0,
            scale: 0.1 * scene.scaleFactor,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                bear.destroy();
            }
        });
    }

    static bearDeath(scene, bear) {
        bear.setTint(0xff0000);  // Sets the tint to red

        scene.tweens.add({
            targets: bear,
            alpha: 0,
            scale: 0.1 * scene.scaleFactor,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                bear.destroy();
            }
        });
    }

    static hitMouseWithBullet(scene, bullet, mouse) {
        this.mouseDeath(scene, mouse);
    
        bullet.setActive(false).setVisible(false);
        scene.bullets.killAndHide(bullet);
        const baseScore = 30; // Slightly higher score for mice
        const playerManager = PlayerManager.getInstance();
        const multiplier = playerManager.getUpgradeEffect('basicMultiplier');
        const scoreGained = Math.floor(baseScore * multiplier);
            
        scene.score += scoreGained;
        scene.showFloatingText(mouse.x, mouse.y, `+${scoreGained}`);
        scene.scoreText.setText('Score: ' + scene.score);
    
        this.checkEnemySpawn(scene);
    }
    
    static hitMouse(scene, player, mouse) {
        this.mouseDeath(scene, mouse);
        
        const baseScore = 15; // Slightly higher score for mice
        const playerManager = PlayerManager.getInstance();
        const multiplier = playerManager.getUpgradeEffect('basicMultiplier');
        const scoreGained = Math.floor(baseScore * multiplier);
        
        scene.score += scoreGained;
        scene.showFloatingText(mouse.x, mouse.y, `+${scoreGained}`);
    
        scene.scoreText.setText('Score: ' + scene.score);
        player.takeDamage(3); // Mice deal slightly less damage
    
        this.checkEnemySpawn(scene);
    }
    
    static mouseDeath(scene, mouse) {
        mouse.setTint(0xff0000);  // Sets the tint to red
    
        scene.tweens.add({
            targets: mouse,
            alpha: 0,
            scale: 0.1 * scene.scaleFactor,
            duration: 200, // Slightly faster death animation for mice
            ease: 'Power2',
            onComplete: () => {
                mouse.destroy();
            }
        });
    }
    
    static checkEnemySpawn(scene) {
        if (scene.bears.countActive(true) === 0 && scene.mice.countActive(true) === 0) {
            this.spawnEnemies(scene);
        }
    }

    static checkBearSpawn(scene) {
        if (scene.bears.countActive(true) === 0) {
            this.spawnBears(scene);
        }
    }

    static spawnBear(scene) {
        if (!scene.gameActive) return;

        const edge = Phaser.Math.Between(0, 3);
        let x, y;

        switch(edge) {
            case 0: // Top
                x = Phaser.Math.Between(0, scene.screenWidth);
                y = 0;
                break;
            case 1: // Right
                x = scene.screenWidth;
                y = Phaser.Math.Between(0, scene.screenHeight);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(0, scene.screenWidth);
                y = scene.screenHeight;
                break;
            case 3: // Left
                x = 0;
                y = Phaser.Math.Between(0, scene.screenHeight);
                break;
        }

        const bear = scene.bears.create(x, y, 'bear');
        const scale = Phaser.Math.FloatBetween(0.3, 0.7) * scene.scaleFactor;
        bear.setScale(scale);

        const centerX = scene.screenWidth / 2;
        const centerY = scene.screenHeight / 2;
        const angle = Phaser.Math.Angle.Between(x, y, centerX, centerY);
        scene.physics.velocityFromRotation(angle, 100 * scene.scaleFactor, bear.body.velocity);
    }

    static spawnMouse(scene) {
        if (!scene.gameActive) return;
    
        const edge = Phaser.Math.Between(0, 3);
        let x, y;
    
        switch(edge) {
            case 0: // Top
                x = Phaser.Math.Between(0, scene.screenWidth);
                y = 0;
                break;
            case 1: // Right
                x = scene.screenWidth;
                y = Phaser.Math.Between(0, scene.screenHeight);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(0, scene.screenWidth);
                y = scene.screenHeight;
                break;
            case 3: // Left
                x = 0;
                y = Phaser.Math.Between(0, scene.screenHeight);
                break;
        }
    
        const mouse = scene.mice.create(x, y, 'mouse-stand');
        const scale = Phaser.Math.FloatBetween(0.3, 0.7) * scene.scaleFactor;
        mouse.setScale(scale);
    
        mouse.play('mouse-walk');
    
        const centerX = scene.screenWidth / 2;
        const centerY = scene.screenHeight / 2;
        const angle = Phaser.Math.Angle.Between(x, y, centerX, centerY);
        scene.physics.velocityFromRotation(angle, 150 * scene.scaleFactor, mouse.body.velocity);
    
        // Flip the mouse based on direction
        if (mouse.body.velocity.x < 0) {
            mouse.setFlipX(true);
        }
    }
    
    static spawnEnemies(scene) {
        const totalEnemies = 10;
        const mouseRatio = Math.min(scene.score / 1000, 0.5); // Increase mouse ratio as score increases, up to 50%
    
        for (let i = 0; i < totalEnemies; i++) {
            if (Math.random() < mouseRatio) {
                Utils.spawnMouse(scene);
            } else {
                Utils.spawnBear(scene);
            }
        }

    
    }
    
    static startDynamicEnemySpawn(scene) {
        if (!scene.gameActive) return;
    
        if (Phaser.Math.Between(0, 1) === 0) {
            Utils.spawnBear(scene);
        } else {
            Utils.spawnMouse(scene);
        }
        const elapsedTime = 120 - scene.gameTime;
        const newDelay = Math.max(Utils.minSpawnRate, Utils.baseSpawnRate - (elapsedTime * 5));

        Utils.spawnTimer = scene.time.delayedCall(newDelay, () => Utils.startDynamicEnemySpawn(scene), [], scene);
        // Rest of the method remains the same
    }
    
    static initEnemySpawn(scene) {
        Utils.startDynamicEnemySpawn(scene);
    }

    static initBearSpawn(scene) {
        Utils.startDynamicBearSpawn(scene);
    }

    static stopBearSpawn() {
        if (Utils.spawnTimer) {
            Utils.spawnTimer.remove();
            Utils.spawnTimer = null;
        }
    }
}