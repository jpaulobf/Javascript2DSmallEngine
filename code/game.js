import { GameLoop } from './game-loop.js';
import { GameRenderer } from './game-rendering.js';

export class Game {

    constructor(config) {
        this.config = config;
        this.fps = 0;
        this.width = config.width;
        this.height = config.height;
        this.started = false;
        this.initialized = false;
        this.paused = false;
        this.destroyed = false;
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
            this.render(context, canvas, renderInterpolation), interpolation);
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
        this.destroyed = true;
    }
}