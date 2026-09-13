export class GameLoop {

    constructor(updateFPS, renderFPS, game, renderCallback, maxUpdatesPerFrame = 5) {
        this.running = false;
        this.updateFPS = updateFPS > 0 ? updateFPS : 60;
        this.renderFPS = renderFPS;
        this.timePerRender = renderFPS > 0 ? 1000 / renderFPS : 0;
        this.fixedDeltaTime = 1 / this.updateFPS;
        this.maxUpdatesPerFrame = maxUpdatesPerFrame;
        this.game = game;
        this.renderCallback = renderCallback;
        this.timerId = null;
        this.animationFrameId = null;
    }

    setUpdateFPS(updateFPS) {
        if (updateFPS <= 0) return;

        this.updateFPS = updateFPS;
        this.fixedDeltaTime = 1 / updateFPS;
    }

    setRenderFPS(renderFPS) {
        this.renderFPS = renderFPS;
        this.timePerRender = renderFPS > 0 ? 1000 / renderFPS : 0;
    }

    start() {
        if (this.running) return;

        this.running = true;
        if (this.renderFPS > 0) {
            this.loopWithFPSLimit();
        } else {
            this.loopRequestAnimationFrame();
        }
    }

    stop() {
        this.running = false;

        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }

        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    loopWithFPSLimit() {
        let lastTime = performance.now();
        let frames = 0;
        let timer = 0;
        let accumulator = 0;

        const loop = () => {
            if (!this.running) return;

            const now = performance.now();
            const elapsed = now - lastTime;
            lastTime = now;
            accumulator = this.processFrame(elapsed, accumulator);
            frames++;
            timer += elapsed;

            if (timer >= 1000) {
                this.game.setCurrentFPS(frames);
                frames = 0;
                timer -= 1000;
            }

            this.timePerRender = this.renderFPS > 0 ? 1000 / this.renderFPS : 0;
            const timeToSleep = Math.max(0, this.timePerRender - (performance.now() - now));

            this.timerId = setTimeout(loop, timeToSleep);
        };

        loop();
    }

    loopRequestAnimationFrame() {
        let lastTime = performance.now();
        let frames = 0;
        let timer = 0;
        let accumulator = 0;

        const loop = (now) => {
            if (!this.running) return;

            const elapsed = now - lastTime;
            lastTime = now;
            accumulator = this.processFrame(elapsed, accumulator);
            frames++;
            timer += elapsed;

            if (timer >= 1000) {
                this.game.setCurrentFPS(frames);
                frames = 0;
                timer -= 1000;
            }

            this.animationFrameId = requestAnimationFrame(loop);
        };

        this.animationFrameId = requestAnimationFrame(loop);
    }

    processFrame(elapsed, accumulator) {
        const elapsedSeconds = Math.min(elapsed / 1000, 0.1);
        accumulator += elapsedSeconds;

        this.game.processInput();
        let updates = 0;
        while (accumulator >= this.fixedDeltaTime && updates < this.maxUpdatesPerFrame) {
            this.game.update(this.fixedDeltaTime);
            accumulator -= this.fixedDeltaTime;
            updates++;
        }

        if (updates === this.maxUpdatesPerFrame && accumulator >= this.fixedDeltaTime) {
            accumulator = 0;
        }

        const interpolation = accumulator / this.fixedDeltaTime;
        this.renderCallback(interpolation);
        return accumulator;
    }
}
