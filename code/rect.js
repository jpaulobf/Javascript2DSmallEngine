export class Rect {

    constructor(x, y, width, height) {
        if (![x, y, width, height].every(Number.isFinite)) throw new TypeError('Rectangle values must be finite');
        if (width < 0 || height < 0) throw new RangeError('Rectangle dimensions must not be negative');

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static overlaps(first, second) {
        if (!first || !second) throw new TypeError('Two rectangles are required');

        return first.x < second.x + second.width && first.x + first.width > second.x &&
            first.y < second.y + second.height && first.y + first.height > second.y;
    }
}