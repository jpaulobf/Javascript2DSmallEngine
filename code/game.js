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
        // Placeholder para processar entradas do usuário
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