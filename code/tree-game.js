import { Game } from './game.js';
import { INVERTED_X, Sprite } from './sprite.js';

export class TreeGame extends Game {

    init() {
        this.spriteWidth = 26;
        this.spriteHeight = 32;
        this.speed = 60;
        this.status = 'ready';

        const tile = new Image();
        tile.src = '../resources/tree_tile.png';
        const frameDuration = 20 / this.config.updateFPS;
        const createTree = (x, y, zoom) => {
            const sprite = new Sprite(tile, this.spriteWidth, this.spriteHeight);
            sprite.addAnimation('default', 0, 4, frameDuration, true, zoom);
            return { sprite, x, y, direction: -1 };
        };

        this.trees = [
            createTree(this.width - 80, 180, {
                rotation: { clockwise: true, speed: 0 }}),
            createTree(this.width - 180, 300, {}),
            createTree(this.width - 280, 420, {
                zoom: { minimum: 1, maximum: 2, duration: 1.2, mode: 'ping-pong' }, rotation: { clockwise: true, speed: 150 }
            }),
            createTree(this.width - 380, 540, {
                zoom: { minimum: 1, maximum: 2, duration: 1.2, mode: 'loop' }
            })
        ];
        this.treeSprite = this.trees[0].sprite;
        this.trees[1].sprite.setZoom(4);

        this.resetGame();
    }

    resetGame() {
        for (const tree of this.trees ?? []) {
            tree.direction = -1;
            tree.sprite.setInverted(true);
            tree.sprite.playAnimation('default', true);
        }
    }

    start() {
        this.status = 'playing';
        super.start();
    }

    update(deltaTime) {
        if (!this.started || this.status !== 'playing') return;

        for (const tree of this.trees) {
            tree.sprite.update(deltaTime);
            tree.x += tree.direction * this.speed * deltaTime;

            const minimumX = (tree.sprite.zoom - 1) * this.spriteWidth / 2;
            const maximumX = this.width - (tree.sprite.zoom + 1) * this.spriteWidth / 2;
            if (tree.x <= minimumX) {
                tree.x = minimumX;
                tree.direction = 1;
                tree.sprite.setInverted(false);
            } else if (tree.x >= maximumX) {
                tree.x = maximumX;
                tree.direction = -1;
                tree.sprite.setInverted(true);
            }
        }
    }

    render(context, canvas) {
        context.fillStyle = '#b9e3f2';
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (const tree of this.trees) {
            tree.sprite.draw(context, tree.x, tree.y, {
                [INVERTED_X]: tree.direction < 0
            });
        }

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