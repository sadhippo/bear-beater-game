export class UpgradeManager {
    static upgrades = [
        {
            id: 'autoClicker',
            name: 'Auto Clicker',
            category: 'passive',
            
            baseEffect: 1,
            baseCost: 100,
            getCost: (level) => Math.floor(100 * Math.pow(1.5, level)),
            getEffect: (level) => 1 + level,
            description: 'Automatically increases points once per second per level'
        },
        {
            id: 'basicMultiplier',
            name: 'Basic Multiplier',
            category: 'multipliers',
            baseEffect: 0.1,
            baseCost: 200,
            getCost: (level) => Math.floor(200 * Math.pow(1.7, level)),
            getEffect: (level) => 1 + (level * 2),
            description: 'Increases all point gains by 200% per level'
        },
        {
            id: 'durationIncrease',
            name: 'Duration Increase',
            category: 'powerups',
            baseEffect: 0.1,
            baseCost: 150,
            getCost: (level) => Math.floor(150 * Math.pow(1.6, level)),
            getEffect: (level) => 1 + (level * 0.1),
            description: 'Increases duration of all power-ups by 10% per level'
        },
        // ... add more upgrades here
    ];

    static getUpgradeById(id) {
        return this.upgrades.find(upgrade => upgrade.id === id);
    }

    static getUpgradesByCategory(category) {
        return this.upgrades.filter(upgrade => upgrade.category === category);
    }

    static getAllCategories() {
        return [...new Set(this.upgrades.map(upgrade => upgrade.category))];
    }

    static getUpgradeCost(id, level) {
        const upgrade = this.getUpgradeById(id);
        return upgrade ? upgrade.getCost(level) : 0;
    }

    static getUpgradeEffect(id, level) {
        const upgrade = this.getUpgradeById(id);
        return upgrade ? upgrade.getEffect(level) : 0;
    }
}