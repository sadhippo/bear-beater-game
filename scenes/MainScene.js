import { Utils } from '../utils/utils.js';
import { Player } from '../entities/player.js';
import { PowerUps } from '../components/powerup.js';
import { GameStorage } from '../utils/GameStorage.js';
import { TelegramStorage } from '../utils/TelegramStorage.js';
import PlayerManager from '../managers/PlayerManager.js';

export class MainScene extends Phaser.Scene {
    
    constructor() {
        super('MainScene');
        this.isGameOver = false;
        this.gameActive = true;
        this.bearSpawnTimer = null;

        this.purpleBullets = false;
        this.activePowerUps = new Set();
        this.powerUpTimers = {};
        this.powerUpBars = {};

        this.gameTimer = null;
        this.gameTime = 120; // 2 minutes in seconds

        this.player = null;
        this.bears = null;
        this.bullets = null;
        this.powerUps = null;
        this.score = 0;
        this.scoreText = null;
        this.hasPowerUp = false;
        this.powerUpTimer = 0;
        this.mice = null;

        // Add responsive variables
        this.screenWidth = null;
        this.screenHeight = null;
        this.scaleFactor = null;
        this.gameOverElements = [];

    }

    preload() {
        // Optimize asset loading for mobile
        this.load.setBaseURL('assets/');
        this.load.image('bull', 'bull.png');
        this.load.image('bear', 'bear.png');
        this.load.image('background', 'background.png');
        this.load.image('powerup', 'powerup.png');
        this.load.image('mouse-stand', 'mouse-stand.png');
        this.load.image('mouse-step', 'mouse-walk.png');
        this.load.image('cat-open', 'cat-open.png');
        this.load.image('cat-closed', 'cat-closed.png');

        // Add loading progress bar
        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        
        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });
        
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
        });
    }

    init() {
        // Set responsive variables
        this.screenWidth = this.sys.game.config.width;
        this.screenHeight = this.sys.game.config.height;
        this.scaleFactor = Math.min(this.screenWidth / 800, this.screenHeight / 600);

        // Initialize game objects with responsive positions
        // (You'll need to adjust these in the create method)
    }

    create() {
        // Set up background
        Telegram.WebApp.ready();

        const background = this.add.image(this.screenWidth / 2, this.screenHeight / 2, 'background');
        const scaleX = this.screenWidth / background.width;
        const scaleY = this.screenHeight / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale).setScrollFactor(0);

        // Create player
        const playerX = this.screenWidth / 2;
        const playerY = this.screenHeight - 100 * this.scaleFactor;
        this.player = new Player(this, this.screenWidth / 2, this.screenHeight / 2, 'cat-closed');

        //this.player = new Player(this, this.screenWidth / 2, this.screenHeight - 100 * this.scaleFactor / 2, 'bull');
        this.player.setCollideWorldBounds(true);
        this.player.create();
        this.player.setScale(0.5 * this.scaleFactor);
        this.player.setupTouchAreas();
        this.gameOverContainer = null;

      

     
        this.activePowerUps = new Set();

       

        // Load power-ups

        // Create projectile texture
        this.createProjectileTexture();
    
        // Set up UI elements
        this.setupUI();
        
    
        // Start the game timer
        this.startGameTimer();
    
        // Create purple projectile
        PowerUps.createPurpleProjectile(this);
    
        // Set up game objects
        this.setupGameObjects();

        this.createTriangleProjectile();
    
        // Set up collisions and overlaps
        this.setupCollisions();
    
        // Set up input
        this.setupInput();
    
        // Spawn initial power-up
        PowerUps.spawnPowerUp(this);
    
        // Set up game-over event
        this.events.on('playerDied', this.gameOver, this);
        this.mouseAnimationWalk();
        this.catShootAnimation();

        // Initialize bear spawning
        Utils.initEnemySpawn(this);

    
        // Set up power-up UI
        this.setupPowerUpUI();

        // Set up enemy animation
      

        this.game.events.on('hidden', () => {
            this.pauseGame();
        }, this);
    
        this.game.events.on('visible', () => {
            this.resumeGame();
        }, this);
    }

    mouseAnimationWalk(){
        this.anims.create({
            key: 'mouse-walk',
            frames: [
                { key: 'mouse-stand' },
                { key: 'mouse-step' }
            ],
            frameRate: 4,
            repeat: -1
        });
        
    }

    catShootAnimation(){
        this.anims.create({
            key: 'catShoot',
            frames: [
                { key: 'cat-closed' },
                { key: 'cat-open' },
                { key: 'cat-closed' }
            ],
            frameRate: 10,
            repeat: 0
        });
        
    }

    loadTotalScore() {
        const playerManager = PlayerManager.getInstance();
        playerManager.load()
            .then(() => {
                this.totalScore = playerManager.totalScore;
                this.updateTotalScoreDisplay();
            })
            .catch(error => {
                console.error('Failed to load total score:', error);
            });
            console.log('start', this.totalScore);
        console.log(this.score);
    }

    saveTotalScore() {
        const playerManager = PlayerManager.getInstance();
        this.totalScore += this.score; // Add the current round's score to the total
        playerManager.totalScore = this.totalScore; // Update PlayerManager's totalScore
        playerManager.save()
            .then(() => {
                console.log('Total score saved successfully');
                //this.updateTotalScoreDisplay(); // Update the UI to reflect the new total score
            })
            .catch(error => {
                console.error('Failed to save total score:', error);
            });
    }

    updateTotalScoreDisplay() {
        this.totalScoreText.setText(`Total Score: ${this.totalScore}`);
        this.score = 0
    }


    createProjectileTexture() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(5, 5, 5);
        graphics.generateTexture('whiteProjectile', 10, 10);
        graphics.destroy();
    }


    createTriangleProjectile() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.beginPath();
        graphics.moveTo(0, -5 * this.scaleFactor);
        graphics.lineTo(4 * this.scaleFactor, 5 * this.scaleFactor);
        graphics.lineTo(-4 * this.scaleFactor, 5 * this.scaleFactor);
        graphics.closePath();
        graphics.fillPath();
        graphics.generateTexture('triangleProjectile', 8 * this.scaleFactor, 10 * this.scaleFactor);
        graphics.destroy();
    }
    
    setupUI() {
        const timerX = this.screenWidth - 10 * this.scaleFactor;
        const timerY = 10 * this.scaleFactor;
        this.timerText = this.add.text(timerX, timerY, 'Time: 2:00', { 
            fontSize: `${32 * this.scaleFactor}px`, 
            fill: '#fff' 
        }).setOrigin(1, 0);
    
        this.scoreText = this.add.text(16 * this.scaleFactor, 16 * this.scaleFactor + 10, 'Score: 0', { 
            fontSize: `${32 * this.scaleFactor}px`, 
            fill: '#fff' 
        });
            // Display total score (initialize with 0, will update when loaded)
            this.totalScoreText = this.add.text(16 * this.scaleFactor + 40, 16 * this.scaleFactor, 'Total Score: 0', { fontSize: '32px', fill: '#fff' });
            // Load total score
            this.loadTotalScore();
    }
    
    startGameTimer() {
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateGameTimer,
            callbackScope: this,
            loop: true
        });
        this.gameTime = 120;
    }
    
    setupGameObjects() {
        this.bears = this.physics.add.group();
        this.bullets = this.physics.add.group({
            defaultKey: 'whiteProjectile',
            maxSize: 200
        });
        this.powerUps = this.physics.add.group();
        this.mice = this.physics.add.group();

    }
    
    setupCollisions() {
        // Bear collisions
        this.physics.add.overlap(this.player, this.bears, (player, bear) => {
            player.takeDamage(1);
            Utils.hitBear(this, player, bear);
        }, null, this);
    
        this.physics.add.collider(this.bullets, this.bears, (bullet, bear) => 
            Utils.hitBearWithBullet(this, bullet, bear), null, this);
    
        // Mouse collisions
        this.physics.add.overlap(this.player, this.mice, (player, mouse) => {
            player.takeDamage(1);  // You might want to adjust this value
            Utils.hitMouse(this, player, mouse);
        }, null, this);
    
        this.physics.add.collider(this.bullets, this.mice, (bullet, mouse) => 
            Utils.hitMouseWithBullet(this, bullet, mouse), null, this);
    
        // Power-up collision
        this.physics.add.overlap(this.player, this.powerUps, (player, powerUp) => 
            PowerUps.collectPowerUp(this, player, powerUp), null, this);
    }
    
    setupInput() {
        this.input.on('pointerdown', (pointer) => {
            Utils.shootProjectiles(this, this.player, pointer);
            this.player.play('catShoot');

        }, this);
    }
    
    setupPowerUpUI() {
        this.powerUpTexts = {};
        this.powerUpBars = {};
        
        const powerUpTypes = ['speed', 'spread', 'purple', 'rapid', 'shield', 'magnet', 'multishot', 'freeze', 'triangle'];
        const colors = {
            speed: 0xffff00,
            spread: 0x00ff00,
            purple: 0x800080,
            rapid: 0xff0000,
            shield: 0x0000ff,
            magnet: 0xff00ff,
            multishot: 0xffa500,
            freeze: 0x00ffff,
            triangle: 0x8B4513 // Brown color for triangle power-up

        };
    
        powerUpTypes.forEach((type, index) => {
            const y = (50 + index * 30) * this.scaleFactor;
            
            // Create power-up icon
            const icon = this.add.circle(15 * this.scaleFactor, y + 10 * this.scaleFactor, 8 * this.scaleFactor, colors[type]);
            
            // Create power-up text
            this.powerUpTexts[type] = this.add.text(30 * this.scaleFactor, y, type, {
                fontSize: `${14 * this.scaleFactor}px`,
                fill: '#fff'
            });
            
            // Create power-up timer bar
            this.powerUpBars[type] = this.add.graphics();
            this.powerUpBars[type].y = y + 20 * this.scaleFactor;
            
            // Initially hide the power-up UI elements
            icon.setVisible(false);
            this.powerUpTexts[type].setVisible(false);
            this.powerUpBars[type].setVisible(false);
        });
    }

    update(time, delta) {
        if (!this.gameActive) return;
    
        
        this.updatePowerUps();
        this.player.updatePosition(time, delta);

        if (this.player.magnetRange > 0) {
            this.powerUps.getChildren().forEach(powerUp => {
                const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, powerUp.x, powerUp.y);
                if (distance <= this.player.magnetRange) {
                    this.physics.moveToObject(powerUp, this.player, 200);
                }
            });
        }

        this.mice.getChildren().forEach(mouse => {
            if (mouse.body.velocity.x < 0) {
                mouse.setFlipX(true);
            } else {
                mouse.setFlipX(false);
            }
        });

    }
    
    
    
    updatePowerUps() {
        const powerUpTypes = ['speed', 'spread', 'purple', 'rapid', 'shield', 'magnet', 'multishot', 'freeze', 'triangle'];
        const colors = {
            speed: 0xffff00,
            spread: 0x00ff00,
            purple: 0x800080,
            rapid: 0xff0000,
            shield: 0x0000ff,
            magnet: 0xff00ff,
            multishot: 0xffa500,
            freeze: 0x00ffff,
            triangle: 0x8B4513 
            
        };
    
        powerUpTypes.forEach(type => {
            if (this.activePowerUps.has(type) && this.powerUpTimers[type]) {
                const remainingTime = Math.ceil((this.powerUpTimers[type].delay - this.powerUpTimers[type].elapsed) / 1000);
                const progress = 1 - (this.powerUpTimers[type].elapsed / this.powerUpTimers[type].delay);
                
                this.powerUpTexts[type].setText(`${type}: ${remainingTime}s`);
                this.powerUpTexts[type].setVisible(true);
                
                this.powerUpBars[type].clear();
                this.powerUpBars[type].fillStyle(colors[type], 1);
                this.powerUpBars[type].fillRect(30 * this.scaleFactor, 0, 100 * this.scaleFactor * progress, 10 * this.scaleFactor);
                this.powerUpBars[type].lineStyle(2, 0xffffff);
                this.powerUpBars[type].strokeRect(30 * this.scaleFactor, 0, 100 * this.scaleFactor, 10 * this.scaleFactor);
                this.powerUpBars[type].setVisible(true);
    
                // Update icon visibility
                const icon = this.children.list.find(child => 
                    child.type === 'Arc' && 
                    child.y === this.powerUpTexts[type].y + 10 * this.scaleFactor
                );
                if (icon) {
                    icon.setVisible(true);
                }
            } else {
                this.powerUpTexts[type].setVisible(false);
                this.powerUpBars[type].clear();
                this.powerUpBars[type].setVisible(false);
    
                // Hide icon
                const icon = this.children.list.find(child => 
                    child.type === 'Arc' && 
                    child.y === this.powerUpTexts[type].y + 10 * this.scaleFactor
                );
                if (icon) {
                    icon.setVisible(false);
                }
            }
        });
    }
    
    restartGame() {

        if (this.gameOverContainer) {
            this.gameOverContainer.destroy();
        }

        this.gameActive = true;
        this.isGameOver = false;
        this.scene.restart();
    }

    pauseGame() {
        this.scene.pause();
        // Additional pause logic if needed
    }

    resumeGame() {
        this.scene.resume();
        // Additional resume logic if needed
    }

    returnHome(){
        this.gameActive = true;
        this.isGameOver = false;
        this.scene.start('StartScreen')
    }
    
    updateGameTimer() {
        if (this.gameTime > 0) {
            this.gameTime--;
            const minutes = Math.floor(this.gameTime / 60);
            const seconds = this.gameTime % 60;
            this.timerText.setText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
            this.gameOver();
        }
    }

    showFloatingText(x, y, text) {
        const floatingText = this.add.text(x, y, text, {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        });
        floatingText.setOrigin(0.5, 0.5);
    
        this.tweens.add({
            targets: floatingText,
            y: y - 100,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                floatingText.destroy();
            }
        });
    }
    
    gameOver() {
    this.gameActive = false;
    if (this.isGameOver) return;
    this.isGameOver = true;
    console.log('Game Over Triggered')
    Utils.stopBearSpawn(this);

    this.physics.pause();
    this.gameTimer.remove();
    if (this.bearSpawnTimer) this.bearSpawnTimer.remove();

    this.bears.children.iterate(function (bear) {
        bear.disableBody(true, true);
    });
    this.mice.children.iterate(function (mouse) {
        mouse.disableBody(true, true);
    });


    // Create a container for all game over elements
    this.gameOverContainer = this.add.container(0, 0);

    const overlay = this.add.rectangle(0, 0, this.screenWidth, this.screenHeight, 0x000000, 0.7);
    overlay.setOrigin(0);
    const currentTotalScore = this.totalScore + this.score;

    console.log('game over', this.totalScore);
    console.log(this.score);
    this.saveTotalScore();

    const gameOverText = this.add.text(this.screenWidth / 2, this.screenHeight / 2 - 75 * this.scaleFactor, 'Game Over', { 
        fontSize: `${64 * this.scaleFactor}px`, 
        fill: '#fff' 
    }).setOrigin(0.5);

    const playAgainButton = this.add.text(this.screenWidth / 2, this.screenHeight / 2 + 0 * this.scaleFactor, 'Play Again', { 
        fontSize: `${32 * this.scaleFactor}px`, 
        fill: '#fff', 
        backgroundColor: '#333', 
        padding: { 
            x: 10 * this.scaleFactor, 
            y: 5 * this.scaleFactor 
        } 
    }).setOrigin(0.5);
    playAgainButton.setInteractive({ useHandCursor: true });
    playAgainButton.on('pointerdown', () => this.restartGame());
    
    const returnButton = this.add.text(this.screenWidth / 2, this.screenHeight / 2 + 50 * this.scaleFactor, 'Home Screen', { 
        fontSize: `${32 * this.scaleFactor}px`, 
        fill: '#fff', 
        backgroundColor: '#333', 
        padding: { 
            x: 10 * this.scaleFactor, 
            y: 5 * this.scaleFactor 
        } 
    }).setOrigin(0.5);
    returnButton.setInteractive({ useHandCursor: true });
    returnButton.on('pointerdown', () => this.returnHome());


    const finalScoreText = this.add.text(this.screenWidth / 2, this.screenHeight / 2 + 120 * this.scaleFactor, `Game Over!\nTotal Score: ${currentTotalScore}`, { 
        fontSize: `${24 * this.scaleFactor}px`, 
        fill: '#fff' 
    }).setOrigin(0.5);

    const finalRoundScoreText = this.add.text(this.screenWidth / 2, this.screenHeight / 2 + 190 * this.scaleFactor, `Round Score: ${this.score}`, { 
        fontSize: `${24 * this.scaleFactor}px`, 
        fill: '#fff' 
    }).setOrigin(0.5);

    // Add all elements to the container
    this.gameOverContainer.add([overlay, gameOverText, playAgainButton, finalScoreText, finalRoundScoreText]);
}
}