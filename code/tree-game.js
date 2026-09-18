import { Game } from './game.js';
import { INVERTED_X, Sprite } from './sprite.js';

export class TreeGame extends Game {

    init() {
        this.speed = 60;
        this.status = 'ready';

        const frameDuration = 20 / this.config.updateFPS;
        const createTree = (x, y, animation, direction = -1) => {
            const sprite = new Sprite('../resources/tree_tile.png', 26, 32);
            sprite.addAnimation(animation);
            return { sprite, x, y, direction, initialDirection: direction };
        };

        this.trees = [
            createTree(this.width - 67, 212, {
                id: 'default', startFrame: 0, frameCount: 4, frameDuration, loop: true,
                rotation: { clockwise: true, speed: 0 }
            }),
            createTree(this.width - 180, 300, {
                id: 'default', startFrame: 0, frameCount: 4, frameDuration, loop: true
            }),
            createTree(this.width - 280, 420, {
                id: 'default', startFrame: 0, frameCount: 4, frameDuration, loop: true,
                zoom: { minimum: 1, maximum: 2, duration: 1.2, mode: 'ping-pong' },
                rotation: { clockwise: true, speed: 5 }
            }),
            createTree(this.width - 330, 480, {
                id: 'default', startFrame: 0, frameCount: 4, frameDuration, loop: true,
                affectsCollision: true
            }, 1),
            createTree(this.width - 380, 540, {
                id: 'default', startFrame: 0, frameCount: 4, frameDuration, loop: true,
                zoom: { minimum: 1, maximum: 2, duration: 1.2, mode: 'loop' }
            }),
            createTree(this.width - 480, 180, {
                id: 'default', startFrame: 0, frameCount: 4, frameDuration, loop: true
            }, 1)
        ];
        this.treeSprite = this.trees[0].sprite;
        this.trees[0].sprite.setAnchor(0.5, 1);
        this.trees[1].sprite.setZoom(4);
        this.trees[3].sprite.setZoom(2, { affectsCollision: true });

        this.resetGame();
    }

    resetGame() {
        for (const tree of this.trees ?? []) {
            tree.direction = tree.initialDirection;
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

            const bounds = tree.sprite.getBounds(tree.x, tree.y);
            const anchorOffsetX = tree.x - bounds.x;
            const minimumX = anchorOffsetX;
            const maximumX = this.width - bounds.width + anchorOffsetX;
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

        const sixthTree = this.trees[3];
        const collidingTrees = [this.trees[2], this.trees[4]].filter(tree =>
            sixthTree.sprite.collidesWith(tree.sprite,
                sixthTree.x, sixthTree.y, tree.x, tree.y));

        if (collidingTrees.length > 0) {
            sixthTree.direction *= -1;
            sixthTree.sprite.setInverted(sixthTree.direction < 0);

            for (const tree of collidingTrees) {
                tree.direction *= -1;
                tree.sprite.setInverted(tree.direction < 0);
            }
        }

        const firstTree = this.trees[0];
        const fifthTree = this.trees[5];
        if (firstTree.sprite.collidesWith(fifthTree.sprite,
            firstTree.x, firstTree.y, fifthTree.x, fifthTree.y)) {
            firstTree.direction *= -1;
            fifthTree.direction *= -1;
            firstTree.sprite.setInverted(firstTree.direction < 0);
            fifthTree.sprite.setInverted(fifthTree.direction < 0);
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