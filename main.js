import { config } from './config/config.js';
import { MainScene } from './scenes/MainScene.js';
import StartScreen from './scenes/startScreen.js';
import ArmouryScene from './scenes/ArmouryScene.js';
import StoreScene from './scenes/StoreScene.js';

let tg = window.Telegram.WebApp;

// Initialize the Web App
tg.ready();

// Expand to full size
tg.expand();

// Function to handle fullscreen
function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
}

// Function to initialize Telegram Web App
function initTelegramWebApp(game) {
    tg.setBackgroundColor('#FFFFFF');
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        // Handle back button click, return to StartScreen
        const currentScene = game.scene.getScenes(true)[0];
        if (currentScene.scene.key !== 'StartScreen') {
            game.scene.start('StartScreen');
        } else {
            // If already on StartScreen, maybe show a "Are you sure you want to quit?" dialog
            if (confirm('Are you sure you want to quit the game?')) {
                tg.close();
            }
        }
    });
}

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Adjust config for Telegram Web App
    const updatedConfig = {
        ...config,
        width: tg.viewportStableWidth,
        height: tg.viewportStableHeight,
        scene: [StartScreen, MainScene, ArmouryScene, StoreScene]
    };

    // Create the game instance
    const game = new Phaser.Game(updatedConfig);

    // Initialize Telegram Web App
    initTelegramWebApp(game);

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        const currentScene = game.scene.getScenes(true)[0];
        if (document.hidden) {
            if (currentScene.scene.isActive()) {
                currentScene.scene.pause();
                currentScene.sys.game.loop.sleep();
            }
        } else {
            if (currentScene.scene.isPaused()) {
                currentScene.scene.resume();
                currentScene.sys.game.loop.wake();
            }
        }
    });

    // Prevent default touch behavior
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
});