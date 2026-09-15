export const INVERTED_X = 'INVERTED_X';
export const INVERTED_Y = 'INVERTED_Y';

export class Sprite {

    constructor(tile, width, height) {
        if (!tile || typeof tile !== 'object') throw new TypeError('A sprite tile is required');
        if (!Number.isFinite(width) || width <= 0) throw new RangeError('Sprite width must be greater than zero');
        if (!Number.isFinite(height) || height <= 0) throw new RangeError('Sprite height must be greater than zero');

        this.tile = tile;
        this.width = width;
        this.height = height;
        this.animations = new Map();
        this.animationId = null;
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.invertedX = false;
        this.invertedY = false;
    }

    addAnimation(id, startFrame, frameCount, frameDuration, loop = true) {
        if (!id) throw new TypeError('Animation id is required');
        if (!Number.isInteger(startFrame) || startFrame < 0) throw new RangeError('Animation start frame must be a non-negative integer');
        if (!Number.isInteger(frameCount) || frameCount <= 0) throw new RangeError('Animation frame count must be greater than zero');
        if (!Number.isFinite(frameDuration) || frameDuration <= 0) throw new RangeError('Animation frame duration must be greater than zero');

        this.animations.set(id, { startFrame, frameCount, frameDuration, loop });
        if (this.animationId === null) this.playAnimation(id);
        return this;
    }

    playAnimation(id, restart = false) {
        if (!this.animations.has(id)) throw new Error(`Unknown animation: ${id}`);
        if (this.animationId === id && !restart) return this;

        this.animationId = id;
        this.frameIndex = 0;
        this.frameTimer = 0;
        return this;
    }

    update(deltaTime) {
        const animation = this.animations.get(this.animationId);
        if (!animation || !Number.isFinite(deltaTime) || deltaTime <= 0) return;

        this.frameTimer += deltaTime;
        while (this.frameTimer >= animation.frameDuration) {
            this.frameTimer -= animation.frameDuration;
            if (this.frameIndex + 1 < animation.frameCount) {
                this.frameIndex++;
            } else if (animation.loop) {
                this.frameIndex = 0;
            } else {
                this.frameIndex = animation.frameCount - 1;
                this.frameTimer = 0;
                break;
            }
        }
    }

    setInverted(invertedX = false, invertedY = false) {
        this.invertedX = Boolean(invertedX);
        this.invertedY = Boolean(invertedY);
        return this;
    }

    getFrame() {
        const animation = this.animations.get(this.animationId);
        return animation ? animation.startFrame + this.frameIndex : 0;
    }

    draw(context, x, y, options = {}) {
        if (!context || typeof context.drawImage !== 'function') throw new TypeError('A Canvas 2D context is required');

        const invertedX = options[INVERTED_X] ?? this.invertedX;
        const invertedY = options[INVERTED_Y] ?? this.invertedY;
        const sourceX = this.getFrame() * this.width;

        context.save();
        context.translate(invertedX ? x + this.width : x, invertedY ? y + this.height : y);
        context.scale(invertedX ? -1 : 1, invertedY ? -1 : 1);
        context.drawImage(this.tile, sourceX, 0, this.width, this.height,
            0, 0, this.width, this.height);
        context.restore();
    }
}