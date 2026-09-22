import { Camera } from './camera.js';
import { Game } from './game.js';
import { Scene } from './scene.js';
import { Sound } from './sound.js';
import { Sprite } from './sprite.js';
import { TileMap } from './tile-map.js';
import { TileSet } from './tile-set.js';
import { UiText } from './ui-text.js';

const TILE_SIZE = 16;
const MARIO_WIDTH = 18;
const MARIO_HEIGHT = 33;
const MARIO_MAX_JUMP_SPEED = 280;
const MARIO_WALK_MAX_JUMP_SPEED = MARIO_MAX_JUMP_SPEED * 0.7;
const MARIO_MIN_JUMP_SPEED = 120;
const MARIO_JUMP_HOLD_TIME = 0.25;
const MARIO_GRAVITY = 1100;
const MARIO_NO_DIRECTION_JUMP_MAX_DRIFT = 30;
const MARIO_NO_DIRECTION_JUMP_DRIFT_SPEED = 40;
const LEVEL_COLUMNS = 160;
const LEVEL_ROWS = 38;
const GROUND_ROW = 32;
const PIT_START_COLUMN = 90;
const PIT_END_COLUMN = 93;

export class MarioDemo extends Game {

    init() {
        this.scene = new Scene();
        this.marioSpeed = 180;
        this.worldMusic = new Sound('../resources/mario.mp3', 1);
        this.coinSound = new Sound('../resources/coin.mp3', 0.1);
        this.oneUpSound = new Sound('../resources/1up.mp3', 0.2);
        this.deadSound = new Sound('../resources/dead.mp3', 1);
        this.jumpSound = new Sound('../resources/jump.mp3', 0.1);
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
        this.camera = new Camera(this.width, this.height, this.worldWidth, this.height);
        this.marioX = MARIO_WIDTH / 2;
        this.marioY = GROUND_ROW * TILE_SIZE;
        this.marioVerticalSpeed = 0;
        this.isJumping = false;
        this.jumpHoldTime = 0;
        this.marioMaxJumpSpeed = MARIO_MAX_JUMP_SPEED;
        this.jumpStartedWithoutDirection = false;
        this.airborneDriftRemaining = 0;
        this.resetGame(true);
    }

    createCoins() {
        return [
            [3 * TILE_SIZE + 8, (GROUND_ROW - 2) * TILE_SIZE + 8],
            [6 * TILE_SIZE + 8, (GROUND_ROW - 2) * TILE_SIZE + 8],
            [17 * TILE_SIZE + 8, 23 * TILE_SIZE + 8],
            [19 * TILE_SIZE + 8, 23 * TILE_SIZE + 8],
            [21 * TILE_SIZE + 8, 23 * TILE_SIZE + 8],
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
            [91 * TILE_SIZE + 8, 16 * TILE_SIZE + 8],
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
                if (this.collectedCoins % 10 === 0) {
                    this.lives++;
                    this.oneUpSound.play();
                }
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
            for (let row = (GROUND_ROW - 1 - step); row <= (GROUND_ROW - 1); row++) {
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
            [16, 22, 25],
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

    isMarioOverPit() {
        const pitStartX = PIT_START_COLUMN * TILE_SIZE;
        const pitEndX = (PIT_END_COLUMN + 1) * TILE_SIZE;
        const marioRight = this.marioX + MARIO_WIDTH / 2;
        const marioLeft = this.marioX - MARIO_WIDTH / 2;
        return marioRight > pitStartX + TILE_SIZE && marioLeft < pitEndX - TILE_SIZE;
    }

    moveMarioHorizontally(delta) {
        const direction = Math.sign(delta);
        const marioHalfWidth = MARIO_WIDTH / 2;
        const minimumMarioX = marioHalfWidth;
        const maximumMarioX = this.worldWidth - marioHalfWidth;
        const previousBounds = this.marioSprite.getCollisionBounds(this.marioX, this.marioY);
        let nextX = Math.max(minimumMarioX, Math.min(maximumMarioX, this.marioX + delta));
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
                this.isJumping = false;
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
                this.isJumping = false;
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
        fillRow(GROUND_ROW, 0, LEVEL_COLUMNS - 1, 0);
        for (let column = 90; column <= 93; column++) level[GROUND_ROW][column] = null;
        for (let row = GROUND_ROW + 1; row < LEVEL_ROWS; row++) {
            fillRow(row, 0, LEVEL_COLUMNS - 1, 0);
            if (row <= GROUND_ROW + 5) {
                for (let column = 90; column <= 93; column++) level[row][column] = null;
            }
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
        fillRow(25, 16, 22, 2);
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
            for (let row = (GROUND_ROW - 1 - step); row <= (GROUND_ROW - 1); row++) {
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

    resetGame(resetLives = true) {
        this.marioX = MARIO_WIDTH / 2;
        this.marioY = GROUND_ROW * TILE_SIZE;
        this.marioVerticalSpeed = 0;
        this.isJumping = false;
        this.jumpHoldTime = 0;
        this.jumpStartedWithoutDirection = false;
        this.airborneDriftRemaining = 0;
        this.camera.moveTo(0, 0);
        this.coins = this.createCoins();
        this.collectedCoins = 0;
        if (resetLives) this.lives = 3;
        this.marioSprite.playAnimation('idle', true);
        this.marioSprite.setInverted(false);
        this.scene.set('ready');
    }

    startMusic() {
        this.worldMusic.loop();
    }

    stopMusic() {
        this.worldMusic.stop();
    }

    start() {
        this.scene.set('playing');
        super.start();
    }

    update(deltaTime) {
        if (!this.started || !this.scene.is('playing', 'falling')) return;

        if (this.scene.is('falling')) {
            this.marioY += this.marioVerticalSpeed * deltaTime;
            this.marioVerticalSpeed += MARIO_GRAVITY * deltaTime;
            this.marioSprite.playAnimation('jump');
            this.marioSprite.update(deltaTime);

            const marioBounds = this.marioSprite.getBounds(this.marioX, this.marioY);
            if (marioBounds.y > this.height) {
                this.scene.set('dead');
                this.lives = Math.max(0, this.lives - 1);
                this.stopMusic();
                const deadAudio = this.deadSound.play();
                deadAudio.addEventListener('ended', () => {
                    this.resetGame(false);
                    this.scene.set('playing');
                    this.startMusic();
                }, { once: true });
            }
            return;
        }

        const direction = (this.isKeyPressed('RIGHT') ? 1 : 0) -
            (this.isKeyPressed('LEFT') ? 1 : 0);
        const isRunning = this.isKeyPressed('B');
        const movementSpeed = this.marioSpeed * (isRunning ? 1.5 : 1);
        let horizontalDelta = direction * movementSpeed * deltaTime;
        // Pulo sem direcao so permite um pequeno arrasto lateral, bem mais lento, ate o limite parametrizado.
        if (this.jumpStartedWithoutDirection && !this.isMarioSupported()) {
            const driftDelta = direction * MARIO_NO_DIRECTION_JUMP_DRIFT_SPEED * deltaTime;
            const allowedDelta = Math.sign(driftDelta) *
                Math.min(Math.abs(driftDelta), this.airborneDriftRemaining);
            this.airborneDriftRemaining -= Math.abs(allowedDelta);
            horizontalDelta = allowedDelta;
        }
        this.marioX = this.moveMarioHorizontally(horizontalDelta);

        const groundY = GROUND_ROW * TILE_SIZE;
        if (this.wasKeyPressed('A') && this.marioVerticalSpeed === 0 && this.isMarioSupported()) {
            this.marioVerticalSpeed = -MARIO_MIN_JUMP_SPEED;
            this.marioMaxJumpSpeed = isRunning ? MARIO_MAX_JUMP_SPEED : MARIO_WALK_MAX_JUMP_SPEED;
            this.jumpHoldTime = 0;
            this.isJumping = true;
            this.jumpStartedWithoutDirection = direction === 0;
            this.airborneDriftRemaining = MARIO_NO_DIRECTION_JUMP_MAX_DRIFT;
            this.jumpSound.play();
        }

        const previousY = this.marioY;
        if (this.isJumping) {
            // Enquanto o botao permanece pressionado, o pulo continua ganhando altura ate o teto maximo.
            if (this.isKeyPressed('A') && this.jumpHoldTime < MARIO_JUMP_HOLD_TIME) {
                this.jumpHoldTime += deltaTime;
                const holdRatio = Math.min(this.jumpHoldTime / MARIO_JUMP_HOLD_TIME, 1);
                this.marioVerticalSpeed = -(MARIO_MIN_JUMP_SPEED +
                    (this.marioMaxJumpSpeed - MARIO_MIN_JUMP_SPEED) * holdRatio);
            } else {
                this.isJumping = false;
            }
        }
        this.marioY += this.marioVerticalSpeed * deltaTime;
        this.marioVerticalSpeed += MARIO_GRAVITY * deltaTime;
        if (this.marioY >= groundY) {
            this.marioY = groundY;
            this.marioVerticalSpeed = 0;
            this.isJumping = false;
        }
        this.resolveObstacleCeiling(previousY);
        this.resolveObstacleLanding(previousY);

        if (this.marioY === groundY && this.isMarioOverPit()) {
            this.scene.set('falling');
            this.marioVerticalSpeed = 0;
            this.marioSprite.playAnimation('jump', true);
        }

        const isSupported = this.marioVerticalSpeed === 0 && this.isMarioSupported();
        if (isSupported) {
            this.jumpStartedWithoutDirection = false;
            this.airborneDriftRemaining = 0;
        }
        if (!isSupported) {
            this.marioSprite.playAnimation('jump');
        } else if (direction === 0) {
            this.marioSprite.playAnimation('idle');
        } else {
            this.marioSprite.playAnimation(isRunning ? 'run' : 'walk');
            this.marioSprite.setInverted(direction < 0);
        }

        this.camera.follow(this.marioX, 0, 0.5, 0, 1);
        this.marioSprite.update(deltaTime);
        this.coinSprite.update(deltaTime);
        this.collectCoins();
    }

    render(context, canvas) {
        const renderCameraX = Math.round(this.camera.x);
        this.renderSky(context, canvas);
        this.tileMap.draw(context, renderCameraX, 0, canvas.width, canvas.height);
        for (const [x, y] of this.coins) {
            this.coinSprite.draw(context, x - renderCameraX, y);
        }
        this.marioSprite.draw(context, this.marioX - renderCameraX, this.marioY);
        this.renderHud(context, canvas);

        if (this.scene.is('ready')) this.renderOverlay(context, canvas);
    }

    renderSky(context, canvas) {
        context.fillStyle = '#9494FF';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#d9f3ff';
        for (const cloud of [[110, 110], [460, 165], [760, 90], [1180, 130], [1660, 175], [2140, 100]]) {
            const x = cloud[0] - this.camera.x * 0.25;
            context.fillRect(x, cloud[1], 64, 16);
            context.fillRect(x + 16, cloud[1] - 12, 32, 12);
        }
    }

    renderHud(context, canvas) {
        UiText.draw(context, `COINS ${this.collectedCoins}`, 16, 28, { color: '#172033', font: '18px Arial' });
        UiText.draw(context, `LIVES ${this.lives}`, 16, 52, { color: '#172033', font: '18px Arial' });
    }

    renderOverlay(context, canvas) {
        context.fillStyle = 'rgba(23, 32, 51, 0.72)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        const textOptions = { color: '#ffffff', align: 'center', baseline: 'middle' };
        UiText.draw(context, 'MARIO TILESET DEMO', canvas.width / 2, canvas.height / 2 - 28,
            { ...textOptions, font: '32px Arial' });
        UiText.draw(context, 'PRESS ENTER, THEN USE LEFT / RIGHT', canvas.width / 2, canvas.height / 2 + 24,
            { ...textOptions, font: '20px Arial' });
    }
}