import { UpgradeManager } from '../managers/UpgradeManager.js' 
import PlayerManager from '../managers/PlayerManager.js' 

export default class ArmouryScene extends Phaser.Scene {
    constructor() {
        super('ArmouryScene');
        this.currentCategory = null;
        this.playerManager = PlayerManager.getInstance();
        this.upgradeList = null;
        this.armouryIsActive = false; // Initialize the flag

    }

    init() {
        this.sceneCreated = false;
        this.currentCategory = null;
        this.upgradeList = null;
        this.armouryIsActive = false; // Reset the flag in init
    }

    create() {
        this.playerManager = PlayerManager.getInstance();
        this.createBackground();
        this.createScoreDisplay();
        this.createCategoryTabs();
        this.createBackButton();
    
        // Load data and update the scene
        this.loadDataAndUpdateScene();
        this.sceneCreated = true;
        this.armouryIsActive = true;

    }

    async loadDataAndUpdateScene() {
        try {
            await this.playerManager.load();
            this.updateSceneWithLoadedData();
        } catch (error) {
            console.error('Error loading player data:', error);
            // Handle the error appropriately
        }
    }
    
    updateSceneWithLoadedData() {
        this.updateScoreDisplay();
        this.updateUpgradeList();
        // Update any other elements that depend on loaded data
    }
    
    updateScoreDisplay() {
        this.ScoreText.setText(`Score: ${this.playerManager.totalScore}`);
    }
    
    updateUpgradeList() {
        if (this.armouryIsActive) {
            if (this.upgradeList) {
                if (typeof this.upgradeList.clear === 'function') {
                    this.upgradeList.clear(true, true);
                } else {
                    console.warn('upgradeList.clear is not a function');
                    // Destroy all children manually
                    this.upgradeList.getChildren().forEach(child => child.destroy());
                }
            }
        
            // Always create a new group
            this.upgradeList = this.add.group();
        
            const upgrades = UpgradeManager.getUpgradesByCategory(this.currentCategory);
            const itemHeight = this.scale.height * 0.15;
            upgrades.forEach((upgrade, index) => {
                const y = this.scale.height * 0.2 + index * itemHeight;
                this.createUpgradeItem(upgrade, y);
            });
        }
    }

    createBackground() {
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8).setOrigin(0);
    }

    createScoreDisplay() {
        const fontSize = this.scale.width * 0.04;
        this.ScoreText = this.add.text(10, 10, `Score: ${this.playerManager.totalScore}`, { fontSize: `${fontSize}px`, fill: '#FFD700' });
    }

    createCategoryTabs() {
        const categories = UpgradeManager.getAllCategories();
        const tabWidth = this.scale.width / categories.length;
        categories.forEach((category, index) => {
            const x = tabWidth * (index + 0.5);
            const y = this.scale.height * 0.1;
            const fontSize = this.scale.width * 0.03;
            const tab = this.add.text(x, y, category, { fontSize: `${fontSize}px`, fill: '#ffffff' })
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => this.selectCategory(category));

            if (index === 0) this.selectCategory(category);
        });
    }

    selectCategory(category) {
        if (category) {
            this.currentCategory = category;
            this.createUpgradeList();
        } else {
            console.warn('Attempted to select undefined category');
        }
    }

    createUpgradeItem(upgrade, y) {
        const level = this.playerManager.getUpgradeLevel(upgrade.id);
        const cost = UpgradeManager.getUpgradeCost(upgrade.id, level);
        const effect = this.playerManager.getUpgradeEffect(upgrade.id);
        
        const fontSize = this.scale.width * 0.03;
        const smallFontSize = fontSize * 0.8;

        const baseTextStyle = {
            fontSize: `${fontSize}px`,
            fontFamily: 'Arial',
            align: 'left',
        };

        const nameText = this.add.text(this.scale.width * 0.05, y, upgrade.name, { ...baseTextStyle, fill: '#ffffff' });
        const levelText = this.add.text(this.scale.width * 0.35, y, `Lv: ${level}`, { ...baseTextStyle, fill: '#00ff00' });
        const costText = this.add.text(this.scale.width * 0.55, y, `Cost: ${cost}`, { ...baseTextStyle, fill: '#ffff00' });

        const buyButton = this.add.text(this.scale.width * 0.85, y + this.scale.height * 0.02, 'Buy', { fontSize: `${fontSize * 1.2}px`, fill: '#ffffff', backgroundColor: '#0000ff' })
            .setOrigin(0.5)
            .setInteractive()
            .setPadding(5)
            .on('pointerdown', () => this.buyUpgrade(upgrade));

        const descriptionText = this.add.text(this.scale.width * 0.05, y + this.scale.height * 0.05, `${upgrade.description} (Effect: ${effect.toFixed(2)})`, { ...baseTextStyle, fontSize: `${smallFontSize}px`, fill: '#aaaaaa' });

        this.upgradeList.addMultiple([nameText, levelText, costText, buyButton, descriptionText]);
    }

    createUpgradeItem(upgrade, y) {
        const level = this.playerManager.getUpgradeLevel(upgrade.id);
        const cost = UpgradeManager.getUpgradeCost(upgrade.id, level);
        const effect = this.playerManager.getUpgradeEffect(upgrade.id);
        
        const baseTextStyle = {
            fontSize: '28px',
            fontFamily: 'Arial',
            padding: { x: 15, y: 15 },
            align: 'left',
        };

        const nameTextStyle = { ...baseTextStyle, fill: '#ffffff' };
        const levelTextStyle = { ...baseTextStyle, fill: '#00ff00' };
        const costTextStyle = { ...baseTextStyle, fill: '#ffff00' };
        const effectTextStyle = { ...baseTextStyle, fill: '#00ffff' };
        const descriptionTextStyle = { ...baseTextStyle, fontSize: '22px', fill: '#aaaaaa' };

        const nameText = this.add.text(50, y, upgrade.name, nameTextStyle);
        const levelText = this.add.text(300, y, `Level: ${level}`, levelTextStyle);
        const costText = this.add.text(450, y, `Cost: ${cost}`, costTextStyle);
        const effectText = this.add.text(600, y, `Effect: ${effect.toFixed(2)}`, effectTextStyle);

        const buyButton = this.add.text(850, y + 20, 'Buy', { fontSize: '48px', fill: '#ffffff', backgroundColor: '#0000ff' })
            .setInteractive()
            .setOrigin(0.5)
            .setPadding(10)
            .on('pointerdown', () => this.buyUpgrade(upgrade));

        const descriptionText = this.add.text(50, y + 60, upgrade.description, descriptionTextStyle);

        this.upgradeList.addMultiple([nameText, levelText, costText, effectText, buyButton, descriptionText]);
    }

    buyUpgrade(upgrade) {
        if (this.playerManager.upgradeItem(upgrade.id)) {
            this.updateSceneWithLoadedData();
        } else {
            this.showInsufficientFundsMessage();
        }
    }

    showInsufficientFundsMessage() {
        const fontSize = this.scale.width * 0.05;
        const message = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Not enough Score!', 
            { fontSize: `${fontSize}px`, fill: '#ff0000' })
            .setOrigin(0.5);

        this.time.delayedCall(2000, () => message.destroy());
    }

    createBackButton() {
        const fontSize = this.scale.width * 0.06;
        const backButton = this.add.text(this.scale.width * 0.9, this.scale.height * 0.9, 'Back', 
            { fontSize: `${fontSize}px`, fill: '#ffffff', backgroundColor: '#333333' })
            .setInteractive()
            .setPadding(5)
            .setOrigin(0.5)
            .on('pointerdown', () => {
                this.armouryIsActive = false;
                this.scene.stop('ArmouryScene');
                this.scene.start('StartScreen');
            });
    }

    shutdown() {
        // Clean up any objects or states here
        if (this.upgradeList) {
            this.upgradeList.clear(true, true);
        }
        if (this.ScoreText) {
            this.ScoreText.destroy();
        }
    }
}
