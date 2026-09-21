import { BufferingMode, WindowMode } from './constants.js';

export class GameRenderer {

    constructor(config) {
        this.bufferingMode = config.bufferingMode;
        this.windowMode = config.windowMode;

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.windowWidth = config.widescreen ? config.wideWidth : config.width;

        this.initWindow(config.width, config.height);

        this.bufferCanvases = [];
        this.bufferContexts = [];
        this.bufferIndex = -1;

        const bufferCount = this.getBufferCount();
        for (let index = 0; index < bufferCount; index++) {
            const bufferCanvas = document.createElement('canvas');
            bufferCanvas.width = this.canvas.width;
            bufferCanvas.height = this.canvas.height;
            this.bufferCanvases.push(bufferCanvas);
            const bufferContext = bufferCanvas.getContext('2d');
            bufferContext.imageSmoothingEnabled = false;
            this.bufferContexts.push(bufferContext);
        }
    }

    getBufferCount() {
        if (this.bufferingMode === BufferingMode.DOUBLE) return 1;
        if (this.bufferingMode === BufferingMode.TRIPLE) return 2;
        return 0;
    }

    initWindow(width, height) {
        width = this.windowWidth;
        this.canvas.width = width;
        this.canvas.height = height;

        if (this.windowMode === WindowMode.FULLSCREEN || this.windowMode === WindowMode.WINDOWED_FULLSCREEN) {
            this.setFullScreen();
        }
    }

    setFullScreen() {
        if (this.windowMode === WindowMode.FULLSCREEN || this.windowMode === WindowMode.WINDOWED_FULLSCREEN) {
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = 0;
            this.canvas.style.left = 0;
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
        }
    }

    render(drawFrame, interpolation = 1) {
        const isBuffered = this.bufferCanvases.length > 0;
        let context = this.ctx;
        let canvas = this.canvas;

        if (isBuffered) {
            this.bufferIndex = (this.bufferIndex + 1) % this.bufferContexts.length;
            context = this.bufferContexts[this.bufferIndex];
            canvas = this.bufferCanvases[this.bufferIndex];
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        drawFrame(context, canvas, interpolation);
        context.restore();

        if (isBuffered) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(canvas, 0, 0);
        }
    }

}
