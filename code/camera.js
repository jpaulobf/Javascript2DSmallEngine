export class Camera {

    constructor(viewportWidth, viewportHeight, worldWidth = viewportWidth, worldHeight = viewportHeight) {
        this.setViewport(viewportWidth, viewportHeight);
        this.setWorldBounds(worldWidth, worldHeight);
        this.x = 0;
        this.y = 0;
    }

    setViewport(width, height) {
        if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
            throw new RangeError('Camera viewport dimensions must be greater than zero');
        }
        this.viewportWidth = width;
        this.viewportHeight = height;
        return this;
    }

    setWorldBounds(width, height) {
        if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
            throw new RangeError('Camera world dimensions must be greater than zero');
        }
        this.worldWidth = width;
        this.worldHeight = height;
        return this.moveTo(this.x ?? 0, this.y ?? 0);
    }

    moveTo(x, y) {
        if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError('Camera position must be finite');

        this.x = Math.max(0, Math.min(Math.max(0, this.worldWidth - this.viewportWidth), x));
        this.y = Math.max(0, Math.min(Math.max(0, this.worldHeight - this.viewportHeight), y));
        return this;
    }

    follow(x, y, focusX = 0.5, focusY = 0.5, smoothing = 1) {
        if (![x, y, focusX, focusY, smoothing].every(Number.isFinite)) {
            throw new TypeError('Camera follow values must be finite');
        }

        const targetX = x - this.viewportWidth * focusX;
        const targetY = y - this.viewportHeight * focusY;
        const amount = Math.max(0, Math.min(1, smoothing));
        return this.moveTo(this.x + (targetX - this.x) * amount, this.y + (targetY - this.y) * amount);
    }

    toScreenX(x) {
        return x - this.x;
    }

    toScreenY(y) {
        return y - this.y;
    }
}