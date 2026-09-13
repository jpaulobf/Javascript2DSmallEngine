import { Sound } from './sound.js';
import { Game } from './game.js';

export class CarGame extends Game {

    init() {
        this.carWidth = 50;
        this.carHeight = 30;
        this.wheelRadius = 7;
        this.carSpeed = 240;
        this.music = new Sound('../resources/1.mp3');
        this.resetGame();
    }

    resetGame() {
        this.carPositionX = (this.width - this.carWidth) / 2;
        this.carPositionY = (this.height - this.carHeight) / 2;
        this.previousCarPositionX = this.carPositionX;
        this.previousCarPositionY = this.carPositionY;
        this.directionX = 1;
        this.directionY = 0;
    }

    startMusic() {
        this.music.loop();
    }

    stopMusic() {
        this.music.stop();
    }

    processInput() {
        super.processInput();

        const directionChanged = ['UP', 'DOWN', 'LEFT', 'RIGHT']
            .some((action) => this.wasKeyPressed(action));
        if (!directionChanged) return;

        const horizontalDirection = (this.isKeyPressed('RIGHT') ? 1 : 0) -
            (this.isKeyPressed('LEFT') ? 1 : 0);
        const verticalDirection = (this.isKeyPressed('DOWN') ? 1 : 0) -
            (this.isKeyPressed('UP') ? 1 : 0);
        const directionLength = Math.hypot(horizontalDirection, verticalDirection);

        if (directionLength > 0) {
            this.directionX = horizontalDirection / directionLength;
            this.directionY = verticalDirection / directionLength;
        }
    }

    update(deltaTime) {
        if (!this.started) return;

        this.previousCarPositionX = this.carPositionX;
        this.previousCarPositionY = this.carPositionY;

        this.carPositionX += this.directionX * this.carSpeed * deltaTime;
        this.carPositionY += this.directionY * this.carSpeed * deltaTime;

        const maxPositionX = this.width - this.carWidth - this.wheelRadius;
        const maxPositionY = this.height - this.carHeight - this.wheelRadius;
        if (this.carPositionX < 0 || this.carPositionX > maxPositionX) {
            this.carPositionX = Math.max(0, Math.min(maxPositionX, this.carPositionX));
            this.directionX *= -1;
        }
        if (this.carPositionY < 0 || this.carPositionY > maxPositionY) {
            this.carPositionY = Math.max(0, Math.min(maxPositionY, this.carPositionY));
            this.directionY *= -1;
        }
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
        const carPositionY = this.previousCarPositionY +
            (this.carPositionY - this.previousCarPositionY) * interpolation;

        context.fillStyle = 'blue';
        context.fillRect(carPositionX, carPositionY, this.carWidth, this.carHeight);

        context.fillStyle = 'black';
        context.beginPath();
        context.arc(carPositionX + 10, carPositionY + this.carHeight, this.wheelRadius, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.arc(carPositionX + 40, carPositionY + this.carHeight, this.wheelRadius, 0, Math.PI * 2);
        context.fill();

        context.font = '20px Arial';
        context.fillStyle = 'red';
        context.textAlign = 'left';
        context.textBaseline = 'alphabetic';
        context.fillText(`FPS: ${this.fps}`, 10, 30);
    }
}