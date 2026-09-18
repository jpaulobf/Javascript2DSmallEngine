/**
 * Mapa retangular de tiles desenhado a partir de um TileSet.
 */
export class TileMap {

    constructor(tileSet, tiles, options = {}) {
        if (!tileSet || typeof tileSet.draw !== 'function') throw new TypeError('A TileSet is required');
        if (!Array.isArray(tiles) || tiles.length === 0) throw new TypeError('Tile map rows are required');

        const width = tiles[0]?.length;
        if (!Number.isInteger(width) || width === 0 || tiles.some(row => !Array.isArray(row) || row.length !== width)) {
            throw new RangeError('Tile map rows must have the same positive width');
        }

        const { x = 0, y = 0 } = options;
        if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError('Tile map position must be finite');

        this.tileSet = tileSet;
        this.tiles = tiles.map(row => [...row]);
        this.columns = width;
        this.rows = tiles.length;
        this.x = x;
        this.y = y;
    }

    get width() {
        return this.columns * this.tileSet.tileWidth;
    }

    get height() {
        return this.rows * this.tileSet.tileHeight;
    }

    // Retorna o indice armazenado na celula ou null fora do mapa.
    getTile(column, row) {
        if (!Number.isInteger(column) || !Number.isInteger(row)) return null;
        if (column < 0 || column >= this.columns || row < 0 || row >= this.rows) return null;
        return this.tiles[row][column];
    }

    // Atualiza uma celula existente e retorna o proprio mapa.
    setTile(column, row, tileIndex) {
        if (!Number.isInteger(column) || !Number.isInteger(row)) throw new TypeError('Tile coordinates must be integers');
        if (column < 0 || column >= this.columns || row < 0 || row >= this.rows) throw new RangeError('Tile coordinates are outside the map');
        if (tileIndex !== null && (!Number.isInteger(tileIndex) || tileIndex < 0)) {
            throw new RangeError('Tile index must be null or a non-negative integer');
        }

        this.tiles[row][column] = tileIndex;
        return this;
    }

    // Desenha somente as celulas que podem aparecer na area visivel.
    draw(context, cameraX = 0, cameraY = 0, viewportWidth = Infinity, viewportHeight = Infinity) {
        if (!context) throw new TypeError('A Canvas 2D context is required');
        if (![cameraX, cameraY].every(Number.isFinite) ||
            ![viewportWidth, viewportHeight].every(value => Number.isFinite(value) || value === Infinity)) {
            throw new TypeError('Camera and viewport values must be finite');
        }

        const tileWidth = this.tileSet.tileWidth;
        const tileHeight = this.tileSet.tileHeight;
        const firstColumn = Math.max(0, Math.floor((cameraX - this.x) / tileWidth));
        const firstRow = Math.max(0, Math.floor((cameraY - this.y) / tileHeight));
        const lastColumn = Math.min(this.columns - 1,
            Number.isFinite(viewportWidth) ? Math.ceil((cameraX + viewportWidth - this.x) / tileWidth) - 1 : this.columns - 1);
        const lastRow = Math.min(this.rows - 1,
            Number.isFinite(viewportHeight) ? Math.ceil((cameraY + viewportHeight - this.y) / tileHeight) - 1 : this.rows - 1);

        for (let row = firstRow; row <= lastRow; row++) {
            for (let column = firstColumn; column <= lastColumn; column++) {
                const tileIndex = this.tiles[row][column];
                if (tileIndex === null || tileIndex === undefined || tileIndex < 0) continue;

                this.tileSet.draw(context, tileIndex,
                    this.x + column * tileWidth - cameraX,
                    this.y + row * tileHeight - cameraY);
            }
        }
    }
}