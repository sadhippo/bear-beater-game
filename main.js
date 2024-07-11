import { config } from './config/config.js';
import { MainScene } from './scenes/MainScene.js';
import StartScreen from './scenes/startScreen.js';
import ArmouryScene from './scenes/ArmouryScene.js';

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

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Create the game instance
    const game = new Phaser.Game({
        ...config,
        scene: [StartScreen, MainScene, ArmouryScene]
    });


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