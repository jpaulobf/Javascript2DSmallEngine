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

        const { x = 0, y = 0, solidTiles = [] } = options;
        if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError('Tile map position must be finite');

        this.tileSet = tileSet;
        this.tiles = tiles.map(row => [...row]);
        this.columns = width;
        this.rows = tiles.length;
        this.x = x;
        this.y = y;
        this.solidTiles = new Set(solidTiles);
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

    // Indica se o indice de tile informado bloqueia movimento.
    isSolidTile(tileIndex) {
        return tileIndex !== null && tileIndex !== undefined && this.solidTiles.has(tileIndex);
    }

    // Indica se a celula do grid e solida.
    isSolidAt(column, row) {
        return this.isSolidTile(this.getTile(column, row));
    }

    // Converte um retangulo em pixels na faixa de colunas/linhas que ele cobre.
    getTileRange(x, y, width, height) {
        return {
            startColumn: Math.max(0, Math.floor((x - this.x) / this.tileSet.tileWidth)),
            endColumn: Math.min(this.columns - 1, Math.ceil((x + width - this.x) / this.tileSet.tileWidth) - 1),
            startRow: Math.max(0, Math.floor((y - this.y) / this.tileSet.tileHeight)),
            endRow: Math.min(this.rows - 1, Math.ceil((y + height - this.y) / this.tileSet.tileHeight) - 1)
        };
    }

    // Retorna o retangulo em pixels ocupado por uma celula do grid.
    getTileBounds(column, row) {
        return {
            x: this.x + column * this.tileSet.tileWidth,
            y: this.y + row * this.tileSet.tileHeight,
            width: this.tileSet.tileWidth,
            height: this.tileSet.tileHeight
        };
    }

    // Retorna os tiles solidos que sobrepoem o retangulo informado.
    getSolidTiles(x, y, width, height) {
        const { startColumn, endColumn, startRow, endRow } = this.getTileRange(x, y, width, height);
        const tiles = [];
        for (let row = startRow; row <= endRow; row++) {
            for (let column = startColumn; column <= endColumn; column++) {
                if (this.isSolidAt(column, row)) tiles.push(this.getTileBounds(column, row));
            }
        }
        return tiles;
    }

    // Retorna apenas os tiles solidos cujo topo funciona como piso (sem tile solido logo acima).
    getSolidSurfaceTiles(x, y, width, height) {
        return this.getSolidTiles(x, y, width, height)
            .filter((bounds) => !this.isSolidAt(Math.round((bounds.x - this.x) / this.tileSet.tileWidth),
                Math.round((bounds.y - this.y) / this.tileSet.tileHeight) - 1));
    }

    // Retorna apenas os tiles solidos cuja base funciona como teto (sem tile solido logo abaixo).
    getSolidCeilingTiles(x, y, width, height) {
        return this.getSolidTiles(x, y, width, height)
            .filter((bounds) => !this.isSolidAt(Math.round((bounds.x - this.x) / this.tileSet.tileWidth),
                Math.round((bounds.y - this.y) / this.tileSet.tileHeight) + 1));
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