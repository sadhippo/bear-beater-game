import { UpgradeManager } from './UpgradeManager.js' 

export default class PlayerManager {
    constructor() {
        this.totalScore = 0;
        this.upgrades = {};
        this.scoreMultiplier = 1;
    }

    addScore(amount) {
        this.totalScore += amount;
        this.save();
    }

    spendScore(amount) {
        if (this.totalScore >= amount) {
            this.totalScore -= amount;
            this.save();
            return true;
        }
        return false;
    }

    getUpgradeLevel(upgradeId) {
        return this.upgrades[upgradeId] || 0;
    }

    upgradeItem(upgradeId) {
        const upgrade = UpgradeManager.getUpgradeById(upgradeId);
        if (!upgrade) return false;

        const currentLevel = this.getUpgradeLevel(upgradeId);
        const cost = UpgradeManager.getUpgradeCost(upgradeId, currentLevel);

        if (this.spendScore(cost)) {
            this.upgrades[upgradeId] = (this.upgrades[upgradeId] || 0) + 1;
            if (upgradeId === 'basicMultiplier') {
                this.updateScoreMultiplier();
            }
            this.save();
            return true;
        }
        return false;
    }

    updateScoreMultiplier() {
        const multiplierLevel = this.getUpgradeLevel('basicMultiplier');
        this.scoreMultiplier = UpgradeManager.getUpgradeEffect('basicMultiplier', multiplierLevel);
    }

    getUpgradeEffect(upgradeId) {
        const level = this.getUpgradeLevel(upgradeId);
        return UpgradeManager.getUpgradeEffect(upgradeId, level);
    }


    async save() {
        // Save data to storage (e.g., Telegram storage)
        const dataToSave = {
            totalScore: this.totalScore,
            upgrades: this.upgrades,
        };
        await this.saveData(dataToSave);
    }

    async load() {
        const data = await this.loadData();
        if (data) {
            this.totalScore = data.totalScore;
            this.upgrades = data.upgrades;
        }
    }
    async loadData() {
        // Implement loading from storage (e.g., Telegram storage)
        // This is a placeholder and should be replaced with actual storage logic
        return JSON.parse(localStorage.getItem('playerData'));
    }

    async saveData(data) {
        // Implement saving to storage (e.g., Telegram storage)
        // This is a placeholder and should be replaced with actual storage logic
        localStorage.setItem('playerData', JSON.stringify(data));
    }
    static getInstance() {
        if (!PlayerManager.instance) {
            PlayerManager.instance = new PlayerManager();
        }
        return PlayerManager.instance;
    }
}