import { BufferingMode, WindowMode } from './constants.js';
import { Sound } from './sound.js';
import { GameLoop } from './game-loop.js';

export class Game {

    constructor(bufferingMode, windowMode, FPS, width, height) {
        this.bufferingMode = bufferingMode;
        this.windowMode = windowMode;
        this.fps = FPS;

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.initWindow(width, height);

        this.carPositionX = 0;
        this.carSpeed = 200.0;
        this.distance = 0.0;

        this.canvasMemoryA = null;
        this.ctxMemoryA = null;

        if (bufferingMode === BufferingMode.DOUBLE) {
            this.canvasMemoryA = document.createElement('canvas');
            this.canvasMemoryA.width = this.canvas.width;
            this.canvasMemoryA.height = this.canvas.height;
            this.ctxMemoryA = this.canvasMemoryA.getContext('2d');
        }

        this.music = new Sound('../resources/1.mp3');
        this.started = false;

        this.gameLoop = new GameLoop(FPS, this);
        this.render();
    }

    start() {
        if (this.gameLoop.running) return;
        this.started = true;
        this.startMusic();
        this.gameLoop.start();
    }

    startMusic() {
        this.music.loop();
    }

    initWindow(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;

        if (this.windowMode === WindowMode.FULLSCREEN || this.windowMode === WindowMode.WINDOWED_FULLSCREEN) {
            this.setFullScreen();
        }
    }

    setFullScreen() {
        if (this.windowMode === WindowMode.FULLSCREEN && document.fullscreenEnabled) {
            this.canvas.requestFullscreen().catch(console.error);
        } else {
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = 0;
            this.canvas.style.left = 0;
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
        }
    }

    setCurrentFPS(fps) {
        this.fps = fps;
    }

    processInput() {
        // Placeholder para processar entradas do usuário
    }

    update(deltaTime) {
        if (this.carPositionX > this.canvas.width - 50) {
            this.carPositionX = this.canvas.width - 50;
            this.carSpeed = -Math.abs(this.carSpeed);
        } else if (this.carPositionX < 0) {
            this.carPositionX = 0;
            this.carSpeed = Math.abs(this.carSpeed);
        }

        this.distance = this.carSpeed * deltaTime;
        this.carPositionX += this.distance;
    }

    render() {
        if (this.bufferingMode === BufferingMode.DOUBLE) {
            this.renderDoubleBuffered();
        } else {
            this.renderNoBuffered();
        }
    }

    renderNoBuffered() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.started) {
            this.renderStartMessage(this.ctx);
            this.ctx.restore();
            return;
        }

        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(this.carPositionX, this.canvas.height - 50, 50, 30);

        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(this.carPositionX + 10, this.canvas.height - 20, 7, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(this.carPositionX + 40, this.canvas.height - 20, 7, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = 'red';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
        this.ctx.fillText(`FPS: ${this.fps}`, 10, 30);

        this.ctx.restore();
    }

    renderDoubleBuffered() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctxMemoryA.clearRect(0, 0, this.canvasMemoryA.width, this.canvasMemoryA.height);

        if (!this.started) {
            this.renderStartMessage(this.ctxMemoryA);
            this.ctx.drawImage(this.canvasMemoryA, 0, 0);
            return;
        }

        this.ctxMemoryA.fillStyle = 'blue';
        this.ctxMemoryA.fillRect(this.carPositionX, this.canvasMemoryA.height - 50, 50, 30);

        this.ctxMemoryA.fillStyle = 'black';
        this.ctxMemoryA.beginPath();
        this.ctxMemoryA.arc(this.carPositionX + 10, this.canvasMemoryA.height - 20, 7, 0, Math.PI * 2);
        this.ctxMemoryA.fill();

        this.ctxMemoryA.beginPath();
        this.ctxMemoryA.arc(this.carPositionX + 40, this.canvasMemoryA.height - 20, 7, 0, Math.PI * 2);
        this.ctxMemoryA.fill();

        this.ctxMemoryA.font = '20px Arial';
        this.ctxMemoryA.fillStyle = 'red';
        this.ctxMemoryA.textAlign = 'left';
        this.ctxMemoryA.textBaseline = 'alphabetic';
        this.ctxMemoryA.fillText(`FPS: ${this.fps}`, 10, 30);

        this.ctx.drawImage(this.canvasMemoryA, 0, 0);
    }

    renderStartMessage(context) {
        context.fillStyle = 'black';
        context.font = '28px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Press ENTER to start', this.canvas.width / 2, this.canvas.height / 2);
    }
}
