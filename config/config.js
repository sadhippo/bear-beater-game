export const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.Telegram.WebApp.viewportStableHeight,
        height: window.Telegram.WebApp.viewportStableHeight,
    },
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { 
            gravity: { y: 0 },
            debug: false
        }
    },
    input: {
        activePointers: 2,
        touch: {
            capture: true,
            maxPointers: 2,
        },
    },
    backgroundColor: '#000000',
    pixelArt: true,
};