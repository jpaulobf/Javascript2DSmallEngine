export const INVERTED_X = 'INVERTED_X';
export const INVERTED_Y = 'INVERTED_Y';
export const AFFECTS_COLLISION = 'AFFECTS_COLLISION';

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
        this.zoom = 1;
        this.affectsCollision = false;
        this.zoomTimer = 0;
        this.zoomDirection = 1;
        this.zoomAnimationEnabled = true;
        this.rotation = 0;
    }

    addAnimation(id, startFrame, frameCount, frameDuration, loop = true, options = {}) {
        if (!id) throw new TypeError('Animation id is required');
        if (!Number.isInteger(startFrame) || startFrame < 0) throw new RangeError('Animation start frame must be a non-negative integer');
        if (!Number.isInteger(frameCount) || frameCount <= 0) throw new RangeError('Animation frame count must be greater than zero');
        if (!Number.isFinite(frameDuration) || frameDuration <= 0) throw new RangeError('Animation frame duration must be greater than zero');

        const zoom = this.validateZoom(options.zoom, frameDuration * frameCount);
        const rotation = this.validateRotation(options.rotation);

        this.animations.set(id, { startFrame, frameCount, frameDuration, loop, zoom,
            rotation,
            affectsCollision: options.affectsCollision ?? options[AFFECTS_COLLISION] ?? false });
        if (this.animationId === null) this.playAnimation(id);
        return this;
    }

    playAnimation(id, restart = false) {
        if (!this.animations.has(id)) throw new Error(`Unknown animation: ${id}`);
        if (this.animationId === id && !restart) return this;

        this.animationId = id;
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.zoomTimer = 0;
        this.zoomDirection = 1;
        this.zoomAnimationEnabled = true;
        this.rotation = 0;
        this.applyAnimationZoom();
        return this;
    }

    update(deltaTime) {
        const animation = this.animations.get(this.animationId);
        if (!animation || !Number.isFinite(deltaTime) || deltaTime <= 0) return;

        this.updateZoom(deltaTime, animation);
        this.updateRotation(animation);
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

    validateZoom(zoom, defaultDuration) {
        if (zoom === undefined) return null;
        if (!zoom || typeof zoom !== 'object') throw new TypeError('Animation zoom must be an object');

        const minimum = zoom.minimum ?? 1;
        const maximum = zoom.maximum ?? minimum;
        const duration = zoom.duration ?? defaultDuration;
        const mode = zoom.mode ?? 'ping-pong';
        if (!Number.isFinite(minimum) || minimum <= 0) throw new RangeError('Zoom minimum must be greater than zero');
        if (!Number.isFinite(maximum) || maximum < minimum) throw new RangeError('Zoom maximum must not be less than minimum');
        if (!Number.isFinite(duration) || duration <= 0) throw new RangeError('Zoom duration must be greater than zero');
        if (mode !== 'loop' && mode !== 'ping-pong') throw new RangeError('Zoom mode must be loop or ping-pong');

        return { minimum, maximum, duration, mode };
    }

    updateZoom(deltaTime, animation) {
        if (!animation.zoom || !this.zoomAnimationEnabled) return;

        this.zoomTimer += deltaTime * this.zoomDirection;
        const { minimum, maximum, duration, mode } = animation.zoom;
        if (mode === 'loop') {
            this.zoomTimer %= duration;
            this.zoom = minimum + (maximum - minimum) * this.zoomTimer / duration;
            return;
        }

        while (this.zoomTimer > duration || this.zoomTimer < 0) {
            if (this.zoomTimer > duration) {
                this.zoomTimer = duration - (this.zoomTimer - duration);
                this.zoomDirection = -1;
            } else if (this.zoomTimer < 0) {
                this.zoomTimer = -this.zoomTimer;
                this.zoomDirection = 1;
            }
        }
        this.zoom = minimum + (maximum - minimum) * this.zoomTimer / duration;
    }

    applyAnimationZoom() {
        const animation = this.animations.get(this.animationId);
        if (animation?.zoom) this.zoom = animation.zoom.minimum;
    }

    validateRotation(rotation) {
        if (rotation === undefined) return null;
        if (!rotation || typeof rotation !== 'object') throw new TypeError('Animation rotation must be an object');

        const clockwise = rotation.clockwise ?? false;
        const speed = rotation.speed ?? 0;
        if (typeof clockwise !== 'boolean') throw new TypeError('Rotation clockwise must be boolean');
        if (!Number.isFinite(speed) || speed < 0 || speed > 360) {
            throw new RangeError('Rotation speed must be between 0 and 360');
        }

        return { clockwise, speed };
    }

    updateRotation(animation) {
        if (!animation.rotation) return;

        const direction = animation.rotation.clockwise ? 1 : -1;
        this.rotation = (this.rotation + direction * animation.rotation.speed / 100) % 360;
        if (this.rotation < 0) this.rotation += 360;
    }

    setInverted(invertedX = false, invertedY = false) {
        this.invertedX = Boolean(invertedX);
        this.invertedY = Boolean(invertedY);
        return this;
    }

    setZoom(zoom = 1, options = {}) {
        if (!Number.isFinite(zoom) || zoom <= 0) throw new RangeError('Zoom must be greater than zero');
        this.zoom = zoom;
        this.zoomAnimationEnabled = false;
        this.affectsCollision = options.affectsCollision ?? options[AFFECTS_COLLISION] ?? false;
        return this;
    }

    getFrame() {
        const animation = this.animations.get(this.animationId);
        return animation ? animation.startFrame + this.frameIndex : 0;
    }

    getBounds(x, y, zoom = this.zoom) {
        const width = this.width * zoom;
        const height = this.height * zoom;
        return {
            x: x - (width - this.width) / 2,
            y: y - (height - this.height) / 2,
            width,
            height
        };
    }

    getCollisionBounds(x, y) {
        const animation = this.animations.get(this.animationId);
        const affectsCollision = this.affectsCollision || animation?.affectsCollision === true;
        return this.getBounds(x, y, affectsCollision ? this.zoom : 1);
    }

    draw(context, x, y, options = {}) {
        if (!context || typeof context.drawImage !== 'function') throw new TypeError('A Canvas 2D context is required');

        const invertedX = options[INVERTED_X] ?? this.invertedX;
        const invertedY = options[INVERTED_Y] ?? this.invertedY;
        const sourceX = this.getFrame() * this.width;
        const bounds = this.getBounds(x, y);
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;
        const animation = this.animations.get(this.animationId);
        const rotation = animation?.rotation ? this.rotation * Math.PI / 180 : 0;

        context.save();
        context.translate(bounds.x + centerX, bounds.y + centerY);
        context.rotate(rotation);
        context.scale(invertedX ? -1 : 1, invertedY ? -1 : 1);
        context.drawImage(this.tile, sourceX, 0, this.width, this.height,
            -centerX, -centerY, bounds.width, bounds.height);
        context.restore();
    }
}