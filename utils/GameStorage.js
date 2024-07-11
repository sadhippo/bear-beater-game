import { TelegramStorage } from './TelegramStorage.js';


export class GameStorage {

    static async saveTotalScore(score) {
        try {
            await TelegramStorage.setItem('totalScore', score.toString());
            console.log('Total score saved successfully:', score);
        } catch (error) {
            console.error('Failed to save total score:', error);
        }
    }

    static async getTotalScore() {
        try {
            const score = await TelegramStorage.getItem('totalScore');
            return parseInt(score) || 0;
        } catch (error) {
            console.error('Failed to get total score:', error);
            return 0;
        }
    }

    static async savePowerUps(powerUps) {
        try {
            await TelegramStorage.setItem('powerUps', JSON.stringify(powerUps));
            console.log('Power-ups saved successfully');
        } catch (error) {
            console.error('Failed to save power-ups:', error);
        }
    }

    static async getPowerUps() {
        try {
            const powerUps = await TelegramStorage.getItem('powerUps');
            return JSON.parse(powerUps) || {};
        } catch (error) {
            console.error('Failed to get power-ups:', error);
            return {};
        }
    }
}