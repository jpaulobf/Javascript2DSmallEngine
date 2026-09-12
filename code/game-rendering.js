import { BufferingMode, WindowMode } from './constants.js';

export class GameRenderer {

    constructor(bufferingMode, windowMode, width, height) {
        this.bufferingMode = bufferingMode;
        this.windowMode = windowMode;

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.initWindow(width, height);

        this.canvasMemoryA = null;
        this.ctxMemoryA = null;

        if (bufferingMode === BufferingMode.DOUBLE) {
            this.canvasMemoryA = document.createElement('canvas');
            this.canvasMemoryA.width = this.canvas.width;
            this.canvasMemoryA.height = this.canvas.height;
            this.ctxMemoryA = this.canvasMemoryA.getContext('2d');
        }

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

    render(game) {
        const isDoubleBuffered = this.bufferingMode === BufferingMode.DOUBLE;
        const context = isDoubleBuffered ? this.ctxMemoryA : this.ctx;
        const canvas = isDoubleBuffered ? this.canvasMemoryA : this.canvas;

        context.clearRect(0, 0, canvas.width, canvas.height);
        this.renderFrame(context, canvas, game);

        if (isDoubleBuffered) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.canvasMemoryA, 0, 0);
        }
    }

    renderFrame(context, canvas, game) {
        context.save();
        if (!game.started) {
            this.renderStartMessage(context, canvas);
            context.restore();
            return;
        }

        this.renderCar(context, game, canvas.height);

        context.font = '20px Arial';
        context.fillStyle = 'red';
        context.textAlign = 'left';
        context.textBaseline = 'alphabetic';
        context.fillText(`FPS: ${game.fps}`, 10, 30);

        context.restore();
    }

    renderCar(context, game, canvasHeight) {
        context.fillStyle = 'blue';
        context.fillRect(game.carPositionX, canvasHeight - 50, 50, 30);

        context.fillStyle = 'black';
        context.beginPath();
        context.arc(game.carPositionX + 10, canvasHeight - 20, 7, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.arc(game.carPositionX + 40, canvasHeight - 20, 7, 0, Math.PI * 2);
        context.fill();
    }

    renderStartMessage(context, canvas) {
        context.fillStyle = 'black';
        context.font = '28px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Press ENTER to start', canvas.width / 2, canvas.height / 2);
    }
}
