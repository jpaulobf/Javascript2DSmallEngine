import { GameLoop } from './game-loop.js';
import { GameRenderer } from './game-rendering.js';
import { Sound } from './sound.js';

export class Game {

    constructor(config) {
        this.config = config;
        this.fps = 0;
        this.width = config.widescreen ? config.wideWidth : config.width;
        this.height = config.height;
        this.started = false;
        this.initialized = false;
        this.paused = false;
        this.destroyed = false;
        this.soundIcon = typeof Image !== 'undefined' ? new Image() : null;
        if (this.soundIcon) this.soundIcon.src = '../resources/sound.png';
        this.soundControlSize = 24;
        this.soundControlMargin = 8;
        this.keyMap = new Map([
            ['UP', 'w'],
            ['DOWN', 's'],
            ['LEFT', 'a'],
            ['RIGHT', 'd'],
            ['A', 'k'],
            ['B', 'j'],
            ['C', 'l'],
            ['START', 'Enter'],
            ['SELECT', 'Backspace'],
            ['RESET', 'F12'],
            ['PAUSE', 'p']
        ]);
        this.keyStates = new Map([...this.keyMap.keys()].map((key) => [key, false]));
        this.previousKeyStates = new Map(this.keyStates);
        this.justPressedKeys = new Map(this.keyStates);

        this.keyDownHandler = (event) => this.setKeyState(event.key, true, event);
        this.keyUpHandler = (event) => this.setKeyState(event.key, false, event);
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.keyDownHandler);
            window.addEventListener('keyup', this.keyUpHandler);
        }

        this.renderer = new GameRenderer(config);
    this.pointerDownHandler = (event) => this.handlePointerDown(event);
    this.renderer.canvas.addEventListener('pointerdown', this.pointerDownHandler);
        this.gameLoop = new GameLoop(config.updateFPS, config.renderFPS, this,
            (interpolation) => this.renderFrame(interpolation), config.maxUpdatesPerFrame);
    }

    initialize() {
        if (this.destroyed || this.initialized) return;

        this.init();
        this.initialized = true;
        this.renderFrame();
    }

    start() {
        if (this.destroyed) return;
        this.initialize();
        if (this.gameLoop.running) return;
        this.started = true;
        this.paused = false;
        this.startMusic();
        this.gameLoop.start();
    }

    stop() {
        this.gameLoop.stop();
        this.started = false;
        this.paused = false;
        this.stopMusic();
    }

    pause() {
        if (this.destroyed || !this.started || this.paused) return;

        this.gameLoop.stop();
        this.paused = true;
        this.stopMusic();
    }

    resume() {
        if (this.destroyed || !this.started || !this.paused) return;

        this.paused = false;
        this.startMusic();
        this.gameLoop.start();
    }

    reset() {
        if (this.destroyed) return;
        this.stop();
        this.resetGame();
        this.keyStates = new Map([...this.keyMap.keys()].map((key) => [key, false]));
        this.previousKeyStates = new Map(this.keyStates);
        this.justPressedKeys = new Map(this.keyStates);
        this.renderFrame();
    }

    startMusic() {
    }

    stopMusic() {
    }

    processInput() {
        this.justPressedKeys = new Map([...this.keyStates.keys()].map((key) => [
            key,
            this.keyStates.get(key) && !this.previousKeyStates.get(key)
        ]));
        this.previousKeyStates = new Map(this.keyStates);
    }

    setKeyState(key, isPressed, event) {
        const normalizedKey = key.length === 1 ? key.toLowerCase() : key;
        for (const [action, mappedKey] of this.keyMap) {
            const normalizedMappedKey = mappedKey.length === 1 ? mappedKey.toLowerCase() : mappedKey;
            if (normalizedKey !== normalizedMappedKey) continue;

            this.keyStates.set(action, isPressed);
            event?.preventDefault();
            return;
        }
    }

    isKeyPressed(action) {
        return this.keyStates.get(action) === true;
    }

    wasKeyPressed(action) {
        return this.justPressedKeys.get(action) === true;
    }

    setCurrentFPS(fps) {
        this.fps = fps;
    }

    renderFrame(interpolation = 1) {
        this.renderer.render((context, canvas, renderInterpolation) =>
            this.renderWithSoundControl(context, canvas, renderInterpolation), interpolation);
    }

    renderWithSoundControl(context, canvas, interpolation) {
        this.render(context, canvas, interpolation);
        if (!this.soundIcon?.complete || this.soundIcon.naturalWidth < 48) return;

        const x = canvas.width - this.soundControlSize - this.soundControlMargin;
        const y = canvas.height - this.soundControlSize - this.soundControlMargin;
        const sourceX = Sound.isMuted() ? this.soundControlSize : 0;
        context.drawImage(this.soundIcon, sourceX, 0, this.soundControlSize,
            this.soundControlSize, x, y, this.soundControlSize, this.soundControlSize);
    }

    handlePointerDown(event) {
        const rect = this.renderer.canvas.getBoundingClientRect();
        const scaleX = this.renderer.canvas.width / rect.width;
        const scaleY = this.renderer.canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        const controlX = this.renderer.canvas.width - this.soundControlSize - this.soundControlMargin;
        const controlY = this.renderer.canvas.height - this.soundControlSize - this.soundControlMargin;

        if (x < controlX || x > controlX + this.soundControlSize ||
            y < controlY || y > controlY + this.soundControlSize) return;

        Sound.toggleMuted();
        this.renderFrame();
    }

    init() {
    }

    update(deltaTime) {
    }

    resetGame() {
    }

    render(context, canvas, interpolation) {
    }

    destroy() {
        if (this.destroyed) return;

        this.stop();
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.keyDownHandler);
            window.removeEventListener('keyup', this.keyUpHandler);
        }
        this.renderer.canvas.removeEventListener('pointerdown', this.pointerDownHandler);
        this.destroyed = true;
    }
}