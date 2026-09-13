import { Sound } from './sound.js';
import { Game } from './game.js';

export class CarGame extends Game {

    init() {
        this.music = new Sound('../resources/1.mp3');
        this.resetGame();
    }

    resetGame() {
        this.carPositionX = 0;
        this.previousCarPositionX = this.carPositionX;
        this.carSpeed = 200.0;
        this.distance = 0.0;
    }

    startMusic() {
        this.music.loop();
    }

    stopMusic() {
        this.music.stop();
    }

    update(deltaTime) {
        if (!this.started) return;

        this.previousCarPositionX = this.carPositionX;
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

    render(context, canvas, interpolation) {
        context.font = '20px Arial';
        context.fillStyle = 'red';
        context.textAlign = 'left';
        context.textBaseline = 'alphabetic';

        if (!this.started) {
            context.font = '28px Arial';
            context.fillStyle = 'black';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('Press ENTER to start', canvas.width / 2, canvas.height / 2);
            return;
        }

        const carPositionX = this.previousCarPositionX +
            (this.carPositionX - this.previousCarPositionX) * interpolation;

        context.fillStyle = 'blue';
        context.fillRect(carPositionX, canvas.height - 50, 50, 30);

        context.fillStyle = 'black';
        context.beginPath();
        context.arc(carPositionX + 10, canvas.height - 20, 7, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.arc(carPositionX + 40, canvas.height - 20, 7, 0, Math.PI * 2);
        context.fill();

        context.font = '20px Arial';
        context.fillStyle = 'red';
        context.textAlign = 'left';
        context.textBaseline = 'alphabetic';
        context.fillText(`FPS: ${this.fps}`, 10, 30);
    }
}