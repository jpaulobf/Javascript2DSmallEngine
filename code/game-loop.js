export class GameLoop {

    constructor(targetFPS, game, renderCallback) {
        this.running = false;
        this.targetFPS = targetFPS;
        this.timePerTick = targetFPS > 0 ? 1000 / targetFPS : 0;
        this.game = game;
        this.renderCallback = renderCallback;
        this.timerId = null;
        this.animationFrameId = null;
    }

    setTargetFPS(targetFPS) {
        this.targetFPS = targetFPS;
        this.timePerTick = targetFPS > 0 ? 1000 / targetFPS : 0;
    }

    start() {
        if (this.running) return;

        this.running = true;
        if (this.targetFPS > 0) {
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

        const loop = () => {
            if (!this.running) return;

            const now = performance.now();
            const deltaTime = Math.min((now - lastTime) / 1000, 0.1);
            const elapsed = now - lastTime;
            lastTime = now;
            timer += elapsed;

            this.game.processInput();
            this.game.update(deltaTime);
            this.renderCallback();
            frames++;

            if (timer >= 1000) {
                this.game.setCurrentFPS(frames);
                frames = 0;
                timer -= 1000;
            }

            this.timePerTick = this.targetFPS > 0 ? 1000 / this.targetFPS : 0;
            const timeToSleep = Math.max(0, this.timePerTick - (performance.now() - now));

            this.timerId = setTimeout(loop, timeToSleep);
        };

        loop();
    }

    loopRequestAnimationFrame() {
        let lastTime = performance.now();
        let frames = 0;
        let timer = 0;

        const loop = (now) => {
            if (!this.running) return;

            const deltaTime = Math.min((now - lastTime) / 1000, 0.1);
            lastTime = now;

            this.game.processInput();
            this.game.update(deltaTime);
            this.renderCallback();
            frames++;
            timer += deltaTime * 1000;

            if (timer >= 1000) {
                this.game.setCurrentFPS(frames);
                frames = 0;
                timer -= 1000;
            }

            this.animationFrameId = requestAnimationFrame(loop);
        };

        this.animationFrameId = requestAnimationFrame(loop);
    }
}
