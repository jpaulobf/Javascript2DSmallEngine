export const INVERTED_X = 'INVERTED_X';
export const INVERTED_Y = 'INVERTED_Y';
export const AFFECTS_COLLISION = 'AFFECTS_COLLISION';

/**
 * Representa um sprite baseado em uma spritesheet horizontal.
 *
 * A classe concentra o estado visual do sprite (quadro, inversao, zoom e
 * rotacao), mas recebe a posicao do objeto como argumento ao desenhar ou
 * calcular colisao. Assim, a mesma instancia pode ser reutilizada em jogos
 * diferentes sem armazenar estado de mundo.
 */
export class Sprite {

    // tile pode ser uma imagem existente ou o caminho da spritesheet.
    constructor(tile, width, height) {
        if (typeof tile === 'string') {
            const image = new Image();
            image.src = tile;
            tile = image;
        }
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

    // Registra uma animacao e inicia automaticamente a primeira animacao criada.
    addAnimation(animation, startFrame, frameCount, frameDuration, loop = true, options = {}) {
        if (typeof animation === 'string') {
            animation = { id: animation, startFrame, frameCount, frameDuration, loop, ...options };
        }
        if (!animation || typeof animation !== 'object') throw new TypeError('Animation configuration is required');

        const { id, loop: animationLoop = true } = animation;
        startFrame = animation.startFrame;
        frameCount = animation.frameCount;
        frameDuration = animation.frameDuration;
        loop = animationLoop;
        options = animation;
        if (!id) throw new TypeError('Animation id is required');
        if (!Number.isInteger(startFrame) || startFrame < 0) throw new RangeError('Animation start frame must be a non-negative integer');
        if (!Number.isInteger(frameCount) || frameCount <= 0) throw new RangeError('Animation frame count must be greater than zero');
        if (!Number.isFinite(frameDuration) || frameDuration <= 0) throw new RangeError('Animation frame duration must be greater than zero');

        const zoom = this.validateZoom(animation.zoom, frameDuration * frameCount);
        const rotation = this.validateRotation(animation.rotation);

        this.animations.set(id, {
            startFrame, frameCount, frameDuration, loop, zoom,
            rotation,
            affectsCollision: animation.affectsCollision ?? animation[AFFECTS_COLLISION] ?? false
        });
        if (this.animationId === null) this.playAnimation(id);
        return this;
    }

    // Seleciona uma animacao e reinicia seu estado temporal quando necessario.
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

    // Avanca quadro, zoom e rotacao usando o tempo desde o ultimo update.
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

    // Valida e normaliza as configuracoes opcionais de zoom da animacao.
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

    // Atualiza o zoom animado nos modos loop e ping-pong.
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

    // Aplica o zoom inicial da animacao selecionada.
    applyAnimationZoom() {
        const animation = this.animations.get(this.animationId);
        if (animation?.zoom) this.zoom = animation.zoom.minimum;
    }

    // Valida as configuracoes opcionais de rotacao da animacao.
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

    // Atualiza a rotacao em graus; o valor e convertido para radianos apenas ao desenhar.
    updateRotation(animation) {
        if (!animation.rotation) return;

        const direction = animation.rotation.clockwise ? 1 : -1;
        this.rotation = (this.rotation + direction * animation.rotation.speed / 100) % 360;
        if (this.rotation < 0) this.rotation += 360;
    }

    // Define a orientacao padrao usada quando draw() nao recebe uma opcao propria.
    setInverted(invertedX = false, invertedY = false) {
        this.invertedX = Boolean(invertedX);
        this.invertedY = Boolean(invertedY);
        return this;
    }

    // Define um zoom fixo e informa se esse zoom tambem deve ampliar a colisao.
    setZoom(zoom = 1, options = {}) {
        if (!Number.isFinite(zoom) || zoom <= 0) throw new RangeError('Zoom must be greater than zero');
        this.zoom = zoom;
        this.zoomAnimationEnabled = false;
        this.affectsCollision = options.affectsCollision ?? options[AFFECTS_COLLISION] ?? false;
        return this;
    }

    // Retorna o indice absoluto do quadro atual na spritesheet.
    getFrame() {
        const animation = this.animations.get(this.animationId);
        return animation ? animation.startFrame + this.frameIndex : 0;
    }

    // Calcula os limites visuais centralizados na posicao informada.
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

    // Calcula os limites usados pela colisao, sem zoom por padrao.
    getCollisionBounds(x, y) {
        const animation = this.animations.get(this.animationId);
        const affectsCollision = this.affectsCollision || animation?.affectsCollision === true;
        return this.getBounds(x, y, affectsCollision ? this.zoom : 1);
    }

    // Testa a sobreposicao entre os retangulos AABB de dois sprites.
    collidesWith(otherSprite, x, y, otherX, otherY) {
        if (!otherSprite || typeof otherSprite.getCollisionBounds !== 'function') {
            throw new TypeError('A sprite with collision bounds is required');
        }

        const bounds = this.getCollisionBounds(x, y);
        const otherBounds = otherSprite.getCollisionBounds(otherX, otherY);

        // Comparacoes estritas fazem o contato exato pelas bordas nao colidir.
        return bounds.x < otherBounds.x + otherBounds.width
            && bounds.x + bounds.width > otherBounds.x
            && bounds.y < otherBounds.y + otherBounds.height
            && bounds.y + bounds.height > otherBounds.y;
    }

    // Desenha o quadro atual, aplicando escala, inversao e rotacao em torno do centro.
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