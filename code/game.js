import { Sound } from './sound.js';
import { GameLoop } from './game-loop.js';

export class Game {

    constructor(FPS, width, height) {
        this.fps = FPS;
        this.width = width;
        this.height = height;

        this.carPositionX = 0;
        this.carSpeed = 200.0;
        this.distance = 0.0;
        this.started = false;

        this.music = new Sound('../resources/1.mp3');
        this.gameLoop = new GameLoop(FPS, this);
    }

    setRenderer(renderer) {
        this.gameLoop.setRenderer(renderer);
    }

    start() {
        if (this.gameLoop.running) return;
        this.started = true;
        this.music.loop();
        this.gameLoop.start();
    }

    setCurrentFPS(fps) {
        this.fps = fps;
    }

    processInput() {
        // Placeholder para processar entradas do usuário
    }

    update(deltaTime) {
        if (this.carPositionX > this.width - 50) {
            this.carPositionX = this.width - 50;
            this.carSpeed = -Math.abs(this.carSpeed);
        } else if (this.carPositionX < 0) {
            this.carPositionX = 0;
            this.carSpeed = Math.abs(this.carSpeed);
        }

        this.distance = this.carSpeed * deltaTime;
        this.carPositionX += this.distance;
    }
}