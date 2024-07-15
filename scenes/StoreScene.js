class StoreScene extends Phaser.Scene {
    constructor() {
        super('StoreScene');
    }

    preload() {
        // Load any assets specific to the store scene
    }

    create() {
        this.add.text(this.cameras.main.width / 2, 50, 'STORE', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
    
        // Add store items
        this.createStoreItem(100, 200, 'Extra Lives', '50 Stars', () => this.buyItem('extraLives'));
        this.createStoreItem(100, 300, 'Double Coins', '100 Stars', () => this.buyItem('doubleCoins'));
        this.createStoreItem(100, 400, 'New Character', '200 Toncoin', () => this.buyItem('newCharacter'));
    
        // Add back button
        const backButton = this.add.text(50, 550, 'Back', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setInteractive();
        backButton.on('pointerdown', () => this.scene.start('StartScreen'));
    }
    
    createStoreItem(x, y, name, price, buyCallback) {
        const itemGroup = this.add.group();
        
        const itemText = this.add.text(x, y, name, { fontSize: '24px', fill: '#ffffff' });
        const priceText = this.add.text(x, y + 30, price, { fontSize: '18px', fill: '#ffff00' });
        const buyButton = this.add.text(x + 200, y, 'Buy', { fontSize: '24px', fill: '#00ff00' })
            .setInteractive()
            .on('pointerdown', buyCallback);
    
        itemGroup.add(itemText);
        itemGroup.add(priceText);
        itemGroup.add(buyButton);
    }
    
    buyItem(itemId) {
        // Implement the purchase logic here
        console.log(`Attempting to buy item: ${itemId}`);
        // You'll need to integrate with Telegram's payment API here
    }

    update() {
        // Any continuous updates (if needed)
    }
}