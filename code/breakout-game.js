import { Sound } from './sound.js';
import { Game } from './game.js';

export class BreakoutGame extends Game {

    init() {
        this.paddleWidth = 110;
        this.paddleHeight = 14;
        this.paddleSpeed = 460;
        this.ballRadius = 8;
        this.brickRows = 5;
        this.brickColumns = 10;
        this.brickGap = 6;
        this.brickHeight = 24;
        this.brickMargin = 40;
        this.music = new Sound('../resources/1.mp3');

        this.resetGame();
        this.status = 'ready';
    }

    startMusic() {
        this.music.loop();
    }

    start() {
        if (this.status === 'won' || this.status === 'gameover') {
            this.resetGame();
        }

        this.status = 'playing';
        super.start();
    }

    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.paddleX = (this.width - this.paddleWidth) / 2;
        this.createBricks();
        this.resetBall();
    }

    resetBall() {
        this.ballX = this.width / 2;
        this.ballY = this.height - 70;
        this.ballVelocityX = 220;
        this.ballVelocityY = -260;
    }

    createBricks() {
        const brickWidth = (this.width - this.brickMargin * 2 - this.brickGap * (this.brickColumns - 1)) / this.brickColumns;
        this.bricks = [];

        for (let row = 0; row < this.brickRows; row++) {
            for (let column = 0; column < this.brickColumns; column++) {
                this.bricks.push({
                    x: this.brickMargin + column * (brickWidth + this.brickGap),
                    y: 60 + row * (this.brickHeight + this.brickGap),
                    width: brickWidth,
                    height: this.brickHeight,
                    color: this.getBrickColor(row)
                });
            }
        }
    }

    getBrickColor(row) {
        const colors = ['#f97316', '#ef4444', '#eab308', '#22c55e', '#38bdf8'];
        return colors[row % colors.length];
    }

    processInput() {
        super.processInput();
        if (this.isKeyPressed('LEFT')) this.inputDirection = -1;
        else if (this.isKeyPressed('RIGHT')) this.inputDirection = 1;
        else this.inputDirection = 0;
    }

    update(deltaTime) {
        if (!this.started || this.status !== 'playing') return;

        this.paddleX += this.inputDirection * this.paddleSpeed * deltaTime;
        this.paddleX = Math.max(0, Math.min(this.width - this.paddleWidth, this.paddleX));

        this.ballX += this.ballVelocityX * deltaTime;
        this.ballY += this.ballVelocityY * deltaTime;

        this.handleWallCollision();
        this.handlePaddleCollision();
        this.handleBrickCollisions();

        if (this.ballY - this.ballRadius > this.height) {
            this.lives--;
            if (this.lives === 0) {
                this.status = 'gameover';
            } else {
                this.resetBall();
            }
        }

        if (this.bricks.length === 0) this.status = 'won';
    }

    handleWallCollision() {
        if (this.ballX - this.ballRadius < 0) {
            this.ballX = this.ballRadius;
            this.ballVelocityX = Math.abs(this.ballVelocityX);
        } else if (this.ballX + this.ballRadius > this.width) {
            this.ballX = this.width - this.ballRadius;
            this.ballVelocityX = -Math.abs(this.ballVelocityX);
        }

        if (this.ballY - this.ballRadius < 0) {
            this.ballY = this.ballRadius;
            this.ballVelocityY = Math.abs(this.ballVelocityY);
        }
    }

    handlePaddleCollision() {
        const paddleY = this.height - 40;
        const hitsPaddle = this.ballY + this.ballRadius >= paddleY &&
            this.ballY - this.ballRadius <= paddleY + this.paddleHeight &&
            this.ballX >= this.paddleX &&
            this.ballX <= this.paddleX + this.paddleWidth;

        if (!hitsPaddle || this.ballVelocityY <= 0) return;

        const hitPosition = (this.ballX - this.paddleX) / this.paddleWidth - 0.5;
        this.ballY = paddleY - this.ballRadius;
        this.ballVelocityX = hitPosition * 700;
        this.ballVelocityY = -Math.abs(this.ballVelocityY);
    }

    handleBrickCollisions() {
        for (let index = this.bricks.length - 1; index >= 0; index--) {
            const brick = this.bricks[index];
            const hitsBrick = this.ballX + this.ballRadius >= brick.x &&
                this.ballX - this.ballRadius <= brick.x + brick.width &&
                this.ballY + this.ballRadius >= brick.y &&
                this.ballY - this.ballRadius <= brick.y + brick.height;

            if (!hitsBrick) continue;

            this.bricks.splice(index, 1);
            this.score += 10;
            this.ballVelocityY *= -1;
            return;
        }
    }

    render(context, canvas) {
        context.fillStyle = '#08111f';
        context.fillRect(0, 0, canvas.width, canvas.height);

        this.renderBricks(context);
        this.renderPaddle(context);
        this.renderBall(context);
        this.renderHud(context);

        if (this.status !== 'playing') this.renderOverlay(context, canvas);
    }

    renderBricks(context) {
        for (const brick of this.bricks) {
            context.fillStyle = brick.color;
            context.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
    }

    renderPaddle(context) {
        context.fillStyle = '#f8fafc';
        context.fillRect(this.paddleX, this.height - 40, this.paddleWidth, this.paddleHeight);
    }

    renderBall(context) {
        context.fillStyle = '#f8fafc';
        context.beginPath();
        context.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
        context.fill();
    }

    renderHud(context) {
        context.fillStyle = '#cbd5e1';
        context.font = '18px Arial';
        context.textAlign = 'left';
        context.textBaseline = 'alphabetic';
        context.fillText(`SCORE ${this.score}`, 20, 28);
        context.fillText(`LIVES ${this.lives}`, this.width - 100, 28);
    }

    renderOverlay(context, canvas) {
        context.fillStyle = 'rgba(8, 17, 31, 0.78)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#f8fafc';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '32px Arial';

        if (this.status === 'ready') context.fillText('PRESS ENTER TO START', canvas.width / 2, canvas.height / 2);
        if (this.status === 'won') context.fillText('YOU WIN - PRESS ENTER', canvas.width / 2, canvas.height / 2);
        if (this.status === 'gameover') context.fillText('GAME OVER - PRESS ENTER', canvas.width / 2, canvas.height / 2);
    }
}