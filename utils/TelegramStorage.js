export class TelegramStorage {
    static async setItem(key, value) {
        return new Promise((resolve, reject) => {
            window.Telegram.WebApp.CloudStorage.setItem(key, value, (error, success) => {
                if (error) reject(error);
                else resolve(success);
            });
        });
    }

    static async getItem(key) {
        return new Promise((resolve, reject) => {
            window.Telegram.WebApp.CloudStorage.getItem(key, (error, value) => {
                if (error) reject(error);
                else resolve(value);
            });
        });
    }

    static async removeItem(key) {
        return new Promise((resolve, reject) => {
            window.Telegram.WebApp.CloudStorage.removeItem(key, (error, success) => {
                if (error) reject(error);
                else resolve(success);
            });
        });
    }

    static async getKeys() {
        return new Promise((resolve, reject) => {
            window.Telegram.WebApp.CloudStorage.getKeys((error, keys) => {
                if (error) reject(error);
                else resolve(keys);
            });
        });
    }
}