class DataManager {
    static async setItem(key, value) {
        return new Promise((resolve, reject) => {
            Telegram.WebApp.CloudStorage.setItem(key, value, (error, success) => {
                if (error) reject(error);
                else resolve(success);
            });
        });
    }

    static async getItem(key) {
        return new Promise((resolve, reject) => {
            Telegram.WebApp.CloudStorage.getItem(key, (error, value) => {
                if (error) reject(error);
                else resolve(value);
            });
        });
    }

    static async removeItem(key) {
        return new Promise((resolve, reject) => {
            Telegram.WebApp.CloudStorage.removeItem(key, (error, success) => {
                if (error) reject(error);
                else resolve(success);
            });
        });
    }

    static async getKeys() {
        return new Promise((resolve, reject) => {
            Telegram.WebApp.CloudStorage.getKeys((error, keys) => {
                if (error) reject(error);
                else resolve(keys);
            });
        });
    }

    static async saveGameData(data) {
        try {

            //save general data
            await this.setItem('lastScore', data.score.toString());
            await this.setItem('lastOnlineTime', Date.now().toString());
            await this.setItem('autoClickRate', data.autoClickRate.toString());

            // Save critical data
            await this.setItem('lastScore', data.score.toString());
            await this.setItem('lastLevel', data.level.toString());

            // For larger data, we'll use JSON stringification and split it if necessary
            const gameStateJson = JSON.stringify(data);
            if (gameStateJson.length <= 4096) {
                await this.setItem('gameState', gameStateJson);
            } else {
                // If the data is too large, we'll need to split it
                const chunks = this.splitString(gameStateJson, 4000);
                await Promise.all(chunks.map((chunk, index) => 
                    this.setItem(`gameState_${index}`, chunk)
                ));
                await this.setItem('gameStateChunks', chunks.length.toString());
            }
        } catch (error) {
            console.error('Error saving game data:', error);
            throw error;
        }
    }

   
    static async loadGameData() {
        try {
            const lastScore = parseInt(await this.getItem('lastScore') || '0');
            const lastOnlineTime = parseInt(await this.getItem('lastOnlineTime') || '0');
            const autoClickRate = parseFloat(await this.getItem('autoClickRate') || '0');

            const currentTime = Date.now();
            const offlineTime = (currentTime - lastOnlineTime) / 1000; // in seconds
            const accumulatedScore = Math.floor(offlineTime * autoClickRate);

            const newScore = lastScore + accumulatedScore;

            // Update the score immediately
            await this.setItem('lastScore', newScore.toString());
            await this.setItem('lastOnlineTime', currentTime.toString());

            return {
                score: newScore,
                autoClickRate: autoClickRate,
                offlineEarnings: accumulatedScore,
                // ... other game data ...
            };
        } catch (error) {
            console.error('Error loading game data:', error);
            return {};
        }
    }
    
    static async updateAutoClickRate(newRate) {
        try {
            await this.setItem('autoClickRate', newRate.toString());
            return true;
        } catch (error) {
            console.error('Error updating auto-click rate:', error);
            return false;
        }
    }

    static splitString(str, maxLength) {
        const result = [];
        for (let i = 0; i < str.length; i += maxLength) {
            result.push(str.substr(i, maxLength));
        }
        return result;
    }
}