export default class StartScreen extends Phaser.Scene {
    constructor() {
        super('StartScreen');
    }

    preload() {
        this.load.image('start-background', 'assets/start-background2.png');
        this.load.image('play-button', 'assets/play-button.png');
        this.load.image('play-button2', 'assets/play-button2.png');
        this.load.image('options-button', 'assets/options-button.png');
        this.load.image('upgrade-button', 'assets/upgrade-button.png');


    }

    create() {
        const { width, height } = this.sys.game.config;
        const scaleFactor = Math.min(width / 800, height / 600);

        // Add background
        const background = this.add.image(width / 2, height / 2, 'start-background');
        const scaleX = width / background.width;
        const scaleY = height / background.height;
        background.setScale(Math.max(scaleX, scaleY));

        // Add game title
        this.add.text(width / 2, height * 0.2, 'Cat Blaster', {
            fontSize: `${64 * scaleFactor}px`,
            fill: '#ffffff'
        }).setOrigin(0.5);

         // Add play button for Wave Defense
         const playButton = this.add.image(width * 0.3, height * 0.4, 'play-button')
         .setInteractive()
         .setScale(0.4 * scaleFactor);

     playButton.on('pointerdown', () => {
         this.scene.start('MainScene'); // Rename this to 'WaveDefenseScene' when you create it
     }); 

     // Add upgrade (Armoury) button
     const upgradeButton = this.add.image(width * 0.3, height * 0.6, 'upgrade-button')
         .setInteractive()
         .setScale(0.4 * scaleFactor);

     upgradeButton.on('pointerdown', () => {
         this.scene.start('ArmouryScene'); // Create this scene
         this.scene.get('ArmouryScene').events.once('create', () => {
            console.log('ArmouryScene has finished loading');
        });
     });

     // Add options button
    //  const optionsButton = this.add.image(width * 0.7, height * 0.6, 'options-button')
    //      .setInteractive()
    //      .setScale(0.4 * scaleFactor);

    //  optionsButton.on('pointerdown', () => {
    //      // Handle options button click
    //      console.log('Options button clicked');
    //  });
        // Add instructions
        const instructionsText = 'Tap and hold to move\nTap to shoot';
        this.add.text(width / 2, height * 0.8, instructionsText, {
            fontSize: `${24 * scaleFactor}px`,
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }
}