import { Game } from './game.js';
import { TileMap } from './tile-map.js';
import { TileSet } from './tile-set.js';

const TILE_SIZE = 16;
const LEVEL_COLUMNS = 160;
const LEVEL_ROWS = 38;
const GROUND_ROW = 32;

export class MarioDemo extends Game {

    init() {
        this.status = 'ready';
        this.cameraX = 0;
        this.cameraSpeed = 220;
        this.tileSet = new TileSet('../resources/mario_tiles.png', TILE_SIZE, TILE_SIZE, 8);
        this.tileMap = new TileMap(this.tileSet, this.createLevel());
        this.worldWidth = this.tileMap.width;
        this.resetGame();
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

        // Plataformas e blocos suspensos para inspecionar os tiles principais.
        fillRow(25, 12, 20, 2);
        fillRow(21, 28, 31, 2);
        fillRow(25, 45, 51, 2);
        fillRow(19, 58, 60, 3);
        fillRow(23, 76, 82, 2);
        fillRow(18, 91, 95, 3);

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
        this.cameraX = 0;
        this.status = 'ready';
    }

    start() {
        this.status = 'playing';
        super.start();
    }

    update(deltaTime) {
        if (!this.started || this.status !== 'playing') return;

        const direction = (this.isKeyPressed('RIGHT') ? 1 : 0) -
            (this.isKeyPressed('LEFT') ? 1 : 0);
        const maximumCameraX = Math.max(0, this.worldWidth - this.width);
        this.cameraX = Math.max(0, Math.min(maximumCameraX,
            this.cameraX + direction * this.cameraSpeed * deltaTime));
    }

    render(context, canvas) {
        this.renderSky(context, canvas);
        this.tileMap.draw(context, this.cameraX, 0, canvas.width, canvas.height);
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
        context.fillText(`CAMERA ${Math.round(this.cameraX)} / ${this.worldWidth - this.width}`, 16, 28);
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