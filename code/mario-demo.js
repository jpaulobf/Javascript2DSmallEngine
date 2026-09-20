import { Game } from './game.js';
import { Sound } from './sound.js';
import { Sprite } from './sprite.js';
import { TileMap } from './tile-map.js';
import { TileSet } from './tile-set.js';

const TILE_SIZE = 16;
const MARIO_WIDTH = 18;
const MARIO_HEIGHT = 33;
const MARIO_JUMP_SPEED = 420;
const MARIO_WALK_JUMP_SPEED = MARIO_JUMP_SPEED * 0.7;
const MARIO_GRAVITY = 1100;
const LEVEL_COLUMNS = 160;
const LEVEL_ROWS = 38;
const GROUND_ROW = 32;

export class MarioDemo extends Game {

    init() {
        this.status = 'ready';
        this.cameraX = 0;
        this.cameraSpeed = 220;
        this.marioSpeed = 180;
        this.worldMusic = new Sound('../resources/mario.mp3', 1);
        this.coinSound = new Sound('../resources/coin.mp3', 0.1);
        this.oneUpSound = new Sound('../resources/1up.mp3', 0.2);
        this.tileSet = new TileSet('../resources/mario_tiles.png', TILE_SIZE, TILE_SIZE, 8);
        this.tileMap = new TileMap(this.tileSet, this.createLevel());
        this.marioSprite = new Sprite('../resources/mario.png', MARIO_WIDTH, MARIO_HEIGHT)
            .addAnimation('idle', 0, 1, 1)
            .addAnimation('walk', 1, 3, 0.12)
            .addAnimation('run', 1, 3, 0.06)
            .addAnimation('jump', 4, 1, 1)
            .setAnchor(0.5, 1);
        this.coinSprite = new Sprite('../resources/coins.png', 12, 16)
            .addAnimation('spin', 0, 3, 0.20)
            .setAnchor(0.5, 0.5);
        this.coins = this.createCoins();
        this.pipes = this.createPipes();
        this.cannons = this.createCannons();
        this.stairs = this.createStairs();
        this.platforms = this.createPlatforms();
        this.solidObstacles = [...this.pipes, ...this.cannons, ...this.stairs, ...this.platforms];
        this.worldWidth = this.tileMap.width;
        this.marioX = MARIO_WIDTH / 2;
        this.marioY = GROUND_ROW * TILE_SIZE;
        this.marioVerticalSpeed = 0;
        this.resetGame();
    }

    createCoins() {
        return [
            [3 * TILE_SIZE + 8, (GROUND_ROW - 2) * TILE_SIZE + 8],
            [6 * TILE_SIZE + 8, (GROUND_ROW - 2) * TILE_SIZE + 8],
            [13 * TILE_SIZE + 8, 23 * TILE_SIZE + 8],
            [15 * TILE_SIZE + 8, 23 * TILE_SIZE + 8],
            [17 * TILE_SIZE + 8, 23 * TILE_SIZE + 8],
            [19 * TILE_SIZE + 8, 23 * TILE_SIZE + 8],
            [28 * TILE_SIZE + 8, 19 * TILE_SIZE + 8],
            [31 * TILE_SIZE + 8, 19 * TILE_SIZE + 8],
            [36 * TILE_SIZE + 8, (GROUND_ROW - 2) * TILE_SIZE + 8],
            [38 * TILE_SIZE + 8, (GROUND_ROW - 2) * TILE_SIZE + 8],
            [45 * TILE_SIZE + 8, 23 * TILE_SIZE + 8],
            [47 * TILE_SIZE + 8, 23 * TILE_SIZE + 8],
            [49 * TILE_SIZE + 8, 23 * TILE_SIZE + 8],
            [51 * TILE_SIZE + 8, 23 * TILE_SIZE + 8],
            [58 * TILE_SIZE + 8, 19 * TILE_SIZE + 8],
            [59 * TILE_SIZE + 8, 19 * TILE_SIZE + 8],
            [60 * TILE_SIZE + 8, 19 * TILE_SIZE + 8],
            [65 * TILE_SIZE + 8, 27 * TILE_SIZE + 8],
            [66 * TILE_SIZE + 8, 26 * TILE_SIZE + 8],
            [67 * TILE_SIZE + 8, 25 * TILE_SIZE + 8],
            [68 * TILE_SIZE + 8, 24 * TILE_SIZE + 8],
            [69 * TILE_SIZE + 8, 23 * TILE_SIZE + 8],
            [77 * TILE_SIZE + 8, 21 * TILE_SIZE + 8],
            [79 * TILE_SIZE + 8, 21 * TILE_SIZE + 8],
            [81 * TILE_SIZE + 8, 21 * TILE_SIZE + 8],
            [92 * TILE_SIZE + 8, 16 * TILE_SIZE + 8],
            [94 * TILE_SIZE + 8, 16 * TILE_SIZE + 8],
            [103 * TILE_SIZE + 8, 22 * TILE_SIZE + 8],
            [105 * TILE_SIZE + 8, 22 * TILE_SIZE + 8],
            [107 * TILE_SIZE + 8, 22 * TILE_SIZE + 8],
            [109 * TILE_SIZE + 8, 22 * TILE_SIZE + 8],
            [110 * TILE_SIZE + 8, (GROUND_ROW - 3) * TILE_SIZE + 8],
            [117 * TILE_SIZE + 8, 22 * TILE_SIZE + 8],
            [119 * TILE_SIZE + 8, 22 * TILE_SIZE + 8],
            [121 * TILE_SIZE + 8, 22 * TILE_SIZE + 8],
            [124 * TILE_SIZE + 8, (GROUND_ROW - 2) * TILE_SIZE + 8],
            [128 * TILE_SIZE + 8, (GROUND_ROW - 2) * TILE_SIZE + 8],
            [130 * TILE_SIZE + 8, (GROUND_ROW - 2) * TILE_SIZE + 8],
            [134 * TILE_SIZE + 8, (GROUND_ROW - 2) * TILE_SIZE + 8]
        ];
    }

    collectCoins() {
        this.coins = this.coins.filter(([x, y]) => {
            const collected = this.marioSprite.collidesWith(this.coinSprite,
                this.marioX, this.marioY, x, y);
            if (collected) {
                this.coinSound.play();
                this.collectedCoins++;
                if (this.collectedCoins % 10 === 0) this.oneUpSound.play();
            }
            return !collected;
        });
    }

    createPipes() {
        return [8, 40, 136].map((column) => ({
            x: column * TILE_SIZE,
            y: (GROUND_ROW - 2) * TILE_SIZE,
            width: TILE_SIZE * 2,
            height: TILE_SIZE * 2
        }));
    }

    createCannons() {
        return [{
            x: 110 * TILE_SIZE,
            y: (GROUND_ROW - 1) * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE
        }];
    }

    createStairs() {
        const stairs = [];
        for (let step = 0; step < 5; step++) {
            for (let row = GROUND_ROW - step; row <= GROUND_ROW; row++) {
                stairs.push({
                    x: (65 + step) * TILE_SIZE,
                    y: row * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE
                });
            }
        }
        return stairs;
    }

    createPlatforms() {
        const platformRanges = [
            [12, 20, 25],
            [28, 31, 21],
            [45, 51, 25],
            [58, 60, 21],
            [76, 82, 23],
            [90, 95, 18],
            [103, 109, 24],
            [118, 120, 24],
            [140, 146, 25]
        ];
        return platformRanges.flatMap(([startColumn, endColumn, row]) =>
            Array.from({ length: endColumn - startColumn + 1 }, (_, offset) => ({
                x: (startColumn + offset) * TILE_SIZE,
                y: row * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE
            })));
    }

    isMarioSupported() {
        const groundY = GROUND_ROW * TILE_SIZE;
        if (this.marioY === groundY) return true;

        const marioBounds = this.marioSprite.getCollisionBounds(this.marioX, this.marioY);
        return this.solidObstacles.some((obstacle) => {
            const overlapsHorizontally = marioBounds.x < obstacle.x + obstacle.width &&
                marioBounds.x + marioBounds.width > obstacle.x;
            return overlapsHorizontally && this.marioY === obstacle.y;
        });
    }

    moveMarioHorizontally(direction, speed, deltaTime) {
        const marioHalfWidth = MARIO_WIDTH / 2;
        const minimumMarioX = marioHalfWidth;
        const maximumMarioX = this.worldWidth - marioHalfWidth;
        const previousBounds = this.marioSprite.getCollisionBounds(this.marioX, this.marioY);
        let nextX = Math.max(minimumMarioX, Math.min(maximumMarioX,
            this.marioX + direction * speed * deltaTime));
        let nextBounds = this.marioSprite.getCollisionBounds(nextX, this.marioY);

        for (const obstacle of this.solidObstacles) {
            const overlapsVertically = nextBounds.y < obstacle.y + obstacle.height &&
                nextBounds.y + nextBounds.height > obstacle.y;
            if (!overlapsVertically) continue;

            if (direction > 0 && previousBounds.x + previousBounds.width <= obstacle.x &&
                nextBounds.x + nextBounds.width > obstacle.x) {
                nextX = obstacle.x - marioHalfWidth;
            } else if (direction < 0 && previousBounds.x >= obstacle.x + obstacle.width &&
                nextBounds.x < obstacle.x + obstacle.width) {
                nextX = obstacle.x + obstacle.width + marioHalfWidth;
            }

            nextBounds = this.marioSprite.getCollisionBounds(nextX, this.marioY);
        }

        return nextX;
    }

    resolveObstacleLanding(previousY) {
        if (this.marioVerticalSpeed < 0) return;

        const marioBounds = this.marioSprite.getCollisionBounds(this.marioX, this.marioY);
        for (const obstacle of this.solidObstacles) {
            const overlapsHorizontally = marioBounds.x < obstacle.x + obstacle.width &&
                marioBounds.x + marioBounds.width > obstacle.x;
            if (overlapsHorizontally && previousY <= obstacle.y && this.marioY >= obstacle.y) {
                this.marioY = obstacle.y;
                this.marioVerticalSpeed = 0;
                return;
            }
        }
    }

    resolveObstacleCeiling(previousY) {
        if (this.marioVerticalSpeed >= 0) return;

        const previousTop = previousY - MARIO_HEIGHT;
        const currentTop = this.marioY - MARIO_HEIGHT;
        for (const obstacle of this.solidObstacles) {
            const overlapsHorizontally = this.marioX - MARIO_WIDTH / 2 < obstacle.x + obstacle.width &&
                this.marioX + MARIO_WIDTH / 2 > obstacle.x;
            if (overlapsHorizontally && previousTop >= obstacle.y + obstacle.height &&
                currentTop < obstacle.y + obstacle.height) {
                this.marioY = obstacle.y + obstacle.height + MARIO_HEIGHT;
                this.marioVerticalSpeed = 0;
                return;
            }
        }
    }

    createLevel() {
        const level = Array.from({ length: LEVEL_ROWS }, () =>
            Array(LEVEL_COLUMNS).fill(null));
        const fillRow = (row, start, end, tile) => {
            for (let column = start; column <= end; column++) level[row][column] = tile;
        };

        // Chao continuo com uma borda superior de terra.
        fillRow(GROUND_ROW, 0, LEVEL_COLUMNS - 1, 1);
        for (let row = GROUND_ROW + 1; row < LEVEL_ROWS; row++) {
            fillRow(row, 0, LEVEL_COLUMNS - 1, 0);
        }

        // Matinhos alinhados logo acima do chao.
        for (const [column, tile] of [
            [2, 40], [3, 41], [4, 42],
            [20, 40], [21, 41], [22, 42]
        ]) {
            level[GROUND_ROW - 1][column] = tile;
        }

        // Cano de duas celulas, apoiado logo acima do chao.
        level[GROUND_ROW - 2][8] = 39;
        level[GROUND_ROW - 2][9] = 38;
        level[GROUND_ROW - 1][8] = 47;
        level[GROUND_ROW - 1][9] = 46;

        // Plataformas e blocos suspensos para inspecionar os tiles principais.
        fillRow(25, 12, 20, 2);
        fillRow(21, 28, 31, 2);
        fillRow(25, 45, 51, 2);
        fillRow(21, 58, 60, 3);
        fillRow(23, 76, 82, 2);
        fillRow(18, 90, 95, 3);

        // Cano de duas celulas, apoiado logo acima do chao.
        level[GROUND_ROW - 2][40] = 39;
        level[GROUND_ROW - 2][41] = 38;
        level[GROUND_ROW - 1][40] = 47;
        level[GROUND_ROW - 1][41] = 46;

        // Plataforma elevada com tronco de suporte (tiles da linha 2).
        fillRow(24, 103, 109, 2);
        for (let row = 25; row < GROUND_ROW; row++) {
            level[row][106] = 9;
        }

        // Plataforma em forma de arvore (tiles das linhas 5 e 6).
        for (const [column, tile] of [
            [118, 32], [119, 33], [120, 34]
        ]) {
            level[24][column] = tile;
        }
        for (let row = 25; row < GROUND_ROW; row++) {
            level[row][119] = 9;
        }

        // Matinhos alinhados logo acima do chao.
        for (const [column, tile] of [
            [126, 40], [127, 41], [128, 42],
            [132, 40], [133, 41], [134, 42]
        ]) {
            level[GROUND_ROW - 1][column] = tile;
        }

        // Cano de duas celulas, apoiado logo acima do chao.
        level[GROUND_ROW - 2][136] = 39;
        level[GROUND_ROW - 2][137] = 38;
        level[GROUND_ROW - 1][136] = 47;
        level[GROUND_ROW - 1][137] = 46;

        // Escada formada pelo tile 8, subindo da esquerda para a direita.
        for (let step = 0; step < 5; step++) {
            for (let row = GROUND_ROW - step; row <= GROUND_ROW; row++) {
                level[row][65 + step] = 8;
            }
        }

        // Canhao sobre o chao.
        level[GROUND_ROW - 1][110] = 7;

        // Castelo simples no fim da fase.
        fillRow(25, 140, 146, 4);
        for (let row = 26; row < GROUND_ROW; row++) {
            level[row][140] = 5;
            level[row][146] = 5;
        }
        level[GROUND_ROW - 2][143] = 6;
        level[GROUND_ROW - 1][143] = 14;

        return level;
    }

    resetGame() {
        this.marioX = MARIO_WIDTH / 2;
        this.marioY = GROUND_ROW * TILE_SIZE;
        this.marioVerticalSpeed = 0;
        this.cameraX = 0;
        this.collectedCoins = 0;
        this.marioSprite.playAnimation('idle', true);
        this.marioSprite.setInverted(false);
        this.status = 'ready';
    }

    startMusic() {
        this.worldMusic.loop();
    }

    stopMusic() {
        this.worldMusic.stop();
    }

    start() {
        this.status = 'playing';
        super.start();
    }

    update(deltaTime) {
        if (!this.started || this.status !== 'playing') return;

        const direction = (this.isKeyPressed('RIGHT') ? 1 : 0) -
            (this.isKeyPressed('LEFT') ? 1 : 0);
        const isRunning = this.isKeyPressed('B');
        const movementSpeed = this.marioSpeed * (isRunning ? 1.5 : 1);
        this.marioX = this.moveMarioHorizontally(direction, movementSpeed, deltaTime);

        const groundY = GROUND_ROW * TILE_SIZE;
        if (this.wasKeyPressed('A') && this.marioVerticalSpeed === 0 && this.isMarioSupported()) {
            this.marioVerticalSpeed = -(isRunning ? MARIO_JUMP_SPEED : MARIO_WALK_JUMP_SPEED);
        }
        const previousY = this.marioY;
        this.marioY += this.marioVerticalSpeed * deltaTime;
        this.marioVerticalSpeed += MARIO_GRAVITY * deltaTime;
        if (this.marioY >= groundY) {
            this.marioY = groundY;
            this.marioVerticalSpeed = 0;
        }
        this.resolveObstacleCeiling(previousY);
        this.resolveObstacleLanding(previousY);

        const isSupported = this.marioVerticalSpeed === 0 && this.isMarioSupported();
        if (!isSupported) {
            this.marioSprite.playAnimation('jump');
        } else if (direction === 0) {
            this.marioSprite.playAnimation('idle');
        } else {
            this.marioSprite.playAnimation(isRunning ? 'run' : 'walk');
            this.marioSprite.setInverted(direction < 0);
        }

        const centeredCameraX = this.marioX - this.width / 2;
        const maximumCameraX = Math.max(0, this.worldWidth - this.width);
        this.cameraX = Math.max(0, Math.min(maximumCameraX, centeredCameraX));
        this.marioSprite.update(deltaTime);
        this.coinSprite.update(deltaTime);
        this.collectCoins();
    }

    render(context, canvas) {
        const maximumCameraX = Math.max(0, this.worldWidth - this.width);
        const renderCameraX = Math.max(0, Math.min(maximumCameraX,
            Math.round(this.cameraX)));
        this.renderSky(context, canvas);
        this.tileMap.draw(context, renderCameraX, 0, canvas.width, canvas.height);
        for (const [x, y] of this.coins) {
            this.coinSprite.draw(context, x - renderCameraX, y);
        }
        this.marioSprite.draw(context, this.marioX - renderCameraX, this.marioY);
        this.renderHud(context, canvas);

        if (this.status !== 'playing') this.renderOverlay(context, canvas);
    }

    renderSky(context, canvas) {
        context.fillStyle = '#9494FF';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#d9f3ff';
        for (const cloud of [[110, 110], [460, 165], [760, 90], [1180, 130], [1660, 175], [2140, 100]]) {
            const x = cloud[0] - this.cameraX * 0.25;
            context.fillRect(x, cloud[1], 64, 16);
            context.fillRect(x + 16, cloud[1] - 12, 32, 12);
        }
    }

    renderHud(context, canvas) {
        context.fillStyle = '#172033';
        context.font = '18px Arial';
        context.textAlign = 'left';
        context.fillText(`COINS ${this.collectedCoins}`, 16, 28);
        //context.fillText(`CAMERA ${Math.round(this.cameraX)} / ${this.worldWidth - this.width}`, 16, 28);
        context.textAlign = 'right';
        context.fillText('LEFT / RIGHT', canvas.width - 16, 28);
    }

    renderOverlay(context, canvas) {
        context.fillStyle = 'rgba(23, 32, 51, 0.72)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '32px Arial';
        context.fillText('MARIO TILESET DEMO', canvas.width / 2, canvas.height / 2 - 28);
        context.font = '20px Arial';
        context.fillText('PRESS ENTER, THEN USE LEFT / RIGHT', canvas.width / 2, canvas.height / 2 + 24);
        context.textBaseline = 'alphabetic';
    }
}