export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.health = 10;
        this.maxHealth = 10;
        this.healthBar = null;
        this.healthBarWidth = 200 * scene.scaleFactor;
        this.healthBarHeight = 20 * scene.scaleFactor;
        this.speed = 1;
        this.x = x;
        this.y = y;
        this.lastShotTime = 0;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.isInvincible = false;
        this.invincibilityDuration = 500; // 1 second of invincibility
        
        // Set up touch areas for movement
        this.setupTouchAreas();
    }

    create() {
        // Create health bar
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
    }

    setupTouchAreas() {
        const { width, height } = this.scene.sys.game.config;
        
        // Create a full-screen interactive zone
        const fullScreenArea = this.scene.add.zone(0, 0, width, height).setOrigin(0);

        fullScreenArea.setInteractive();

        fullScreenArea.on('pointerdown', (pointer) => this.startFollowing(pointer));
        fullScreenArea.on('pointermove', (pointer) => this.updatePointerPosition(pointer));
        fullScreenArea.on('pointerup', () => this.stopFollowing());
        fullScreenArea.on('pointerout', () => this.stopFollowing()); // Ensure movement stops if pointer leaves the area
    }

    
    startFollowing(pointer) {
        this.isFollowing = true;
        this.pointerX = pointer.x;
        this.pointerY = pointer.y;
    }

    updatePointerPosition(pointer) {
        if (this.isFollowing) {
            this.pointerX = pointer.x;
            this.pointerY = pointer.y;
        }
    }

    stopFollowing() {
        this.isFollowing = false;
    }

    updatePosition(time, delta) {
        if (this.isFollowing) {
            const speed = 250; // Adjust the speed as needed
            const character = this.sprite;

            // Calculate the distance to move
            const distX = this.pointerX - this.x;
            const distY = this.pointerY - this.y;
            const distance = Math.sqrt(distX * distX + distY * distY);

            if (distance > 5) { // Small threshold to avoid jittering
                const moveX = (distX / distance) * speed * (delta / 1000);
                const moveY = (distY / distance) * speed * (delta / 1000);

                this.setPosition(this.x + moveX, this.y + moveY);
            }
        }
    }
    
    takeDamage(amount) {
        if (this.isInvincible) return;

        console.log('Damage taken', amount)
        this.health = Math.max(0, this.health - amount);
        this.updateHealthBar();
        if (this.health <= 0) {
            this.die();
        }
        // Make player invincible
        this.isInvincible = true;
        this.scene.time.delayedCall(this.invincibilityDuration, () => {
            this.isInvincible = false;
        });
    }

    setSpeed(newSpeed) {
        this.speed = newSpeed;
        this.scene.time.delayedCall(10000, () => {
            this.speed = this.speed / 1.5; // Reset speed after 10 seconds
        });
    }

    updateHealthBar() {
        this.healthBar.clear();
        
        // Background of health bar
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(10 * this.scene.scaleFactor, 10 * this.scene.scaleFactor, this.healthBarWidth, this.healthBarHeight);
        
        // Health remaining
        const healthPercentage = this.health / this.maxHealth;
        this.healthBar.fillStyle(0x00ff00, 1);
        this.healthBar.fillRect(10 * this.scene.scaleFactor, 10 * this.scene.scaleFactor, this.healthBarWidth * healthPercentage, this.healthBarHeight);
    }

    die() {
        // Emit an event that the main scene can listen for
        this.scene.events.emit('playerDied');
        this.setActive(false);
        this.setVisible(false);
    }
}