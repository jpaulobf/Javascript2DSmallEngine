/**
 * Representa uma spritesheet organizada em uma grade de tiles.
 */
export class TileSet {

    // tile pode ser uma imagem existente ou o caminho da spritesheet.
    constructor(tile, tileWidth, tileHeight, columns) {
        if (typeof tile === 'string') {
            const image = new Image();
            image.src = tile;
            tile = image;
        }
        if (!tile || typeof tile !== 'object') throw new TypeError('A tile set image is required');
        if (!Number.isFinite(tileWidth) || tileWidth <= 0) throw new RangeError('Tile width must be greater than zero');
        if (!Number.isFinite(tileHeight) || tileHeight <= 0) throw new RangeError('Tile height must be greater than zero');
        if (!Number.isInteger(columns) || columns <= 0) throw new RangeError('Tile set columns must be greater than zero');

        this.tile = tile;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.columns = columns;
    }

    // Retorna o recorte correspondente ao indice do tile na spritesheet.
    getSourceRect(index) {
        if (!Number.isInteger(index) || index < 0) throw new RangeError('Tile index must be a non-negative integer');

        const column = index % this.columns;
        const row = Math.floor(index / this.columns);
        return {
            x: column * this.tileWidth,
            y: row * this.tileHeight,
            width: this.tileWidth,
            height: this.tileHeight
        };
    }

    // Desenha um tile em coordenadas de destino.
    draw(context, index, x, y, width = this.tileWidth, height = this.tileHeight) {
        if (!context || typeof context.drawImage !== 'function') throw new TypeError('A Canvas 2D context is required');
        if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError('Tile position must be finite');
        if (!Number.isFinite(width) || width <= 0) throw new RangeError('Tile destination width must be greater than zero');
        if (!Number.isFinite(height) || height <= 0) throw new RangeError('Tile destination height must be greater than zero');

        const source = this.getSourceRect(index);
        context.drawImage(this.tile, source.x, source.y, source.width, source.height,
            x, y, width, height);
    }
}