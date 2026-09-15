import { Game } from './game.js';
import { INVERTED_X, Sprite } from './sprite.js';

export class TreeGame extends Game {

    init() {
        this.spriteWidth = 24;
        this.spriteHeight = 32;
        this.speed = 60;
        this.direction = 1;
        this.status = 'ready';

        const tile = new Image();
        tile.src = '../resources/tree_tile.png';
        this.treeSprite = new Sprite(tile, this.spriteWidth, this.spriteHeight);
        this.treeSprite.addAnimation('default', 0, 4, 45 / this.config.updateFPS);

        this.resetGame();
    }

    resetGame() {
        this.treeX = (this.width - this.spriteWidth) / 2;
        this.treeY = (this.height - this.spriteHeight) / 2;
        this.direction = 1;
        this.treeSprite?.setInverted(false);
    }

    start() {
        this.status = 'playing';
        super.start();
    }

    update(deltaTime) {
        if (!this.started || this.status !== 'playing') return;

        this.treeSprite.update(deltaTime);
        this.treeX += this.direction * this.speed * deltaTime;

        const rightLimit = this.width - this.spriteWidth;
        if (this.treeX >= rightLimit) {
            this.treeX = rightLimit;
            this.direction = -1;
            this.treeSprite.setInverted(true);
        } else if (this.treeX <= 0) {
            this.treeX = 0;
            this.direction = 1;
            this.treeSprite.setInverted(false);
        }
    }

    render(context, canvas) {
        context.fillStyle = '#b9e3f2';
        context.fillRect(0, 0, canvas.width, canvas.height);

        this.treeSprite.draw(context, this.treeX, this.treeY, {
            [INVERTED_X]: this.direction < 0
        });

        if (this.status !== 'playing') this.renderOverlay(context, canvas);
    }

    renderOverlay(context, canvas) {
        context.fillStyle = 'rgba(8, 17, 31, 0.78)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#f8fafc';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '32px Arial';
        if (this.status === 'ready') context.fillText('PRESS ENTER TO START', canvas.width / 2, canvas.height / 2);
        context.textBaseline = 'alphabetic';
    }
}