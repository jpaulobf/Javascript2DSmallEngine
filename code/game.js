import { GameLoop } from './game-loop.js';
import { GameRenderer } from './game-rendering.js';

export class Game {

    constructor(config) {
        this.config = config;
        this.fps = config.fps;
        this.width = config.width;
        this.height = config.height;
        this.started = false;
        this.initialized = false;
        this.keyMap = new Map([
            ['UP', 'ArrowUp'],
            ['DOWN', 'ArrowDown'],
            ['LEFT', 'ArrowLeft'],
            ['RIGHT', 'ArrowRight'],
            ['A', 'j'],
            ['B', 'k'],
            ['C', 'l'],
            ['START', 'Enter'],
            ['SELECT', 'Backspace']
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
        this.gameLoop = new GameLoop(config.fps, this, () => this.renderFrame());
    }

    initialize() {
        if (this.initialized) return;

        this.init();
        this.initialized = true;
        this.renderFrame();
    }

    start() {
        this.initialize();
        if (this.gameLoop.running) return;
        this.started = true;
        this.startMusic();
        this.gameLoop.start();
    }

    startMusic() {
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

    renderFrame() {
        this.renderer.render((context, canvas) => this.render(context, canvas));
    }

    init() {
    }

    update(deltaTime) {
    }

    render(context, canvas) {
    }
}