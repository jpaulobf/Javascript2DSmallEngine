import { Game } from './game.js';

export class SnakeGame extends Game {

    init() {
        this.cellSize = 20;
        this.columns = Math.floor(this.width / this.cellSize);
        this.rows = Math.floor(this.height / this.cellSize);
        this.boardWidth = this.columns * this.cellSize;
        this.boardHeight = this.rows * this.cellSize;
        this.boardLeft = (this.width - this.boardWidth) / 2;
        this.boardTop = (this.height - this.boardHeight) / 2;
        this.stepTime = 0.11;
        this.stepTimer = 0;
        this.status = 'ready';

        this.resetGame();
    }

    processInput() {
        super.processInput();
        const directions = {
            UP: { x: 0, y: -1 },
            DOWN: { x: 0, y: 1 },
            LEFT: { x: -1, y: 0 },
            RIGHT: { x: 1, y: 0 }
        };
        for (const action of Object.keys(directions)) {
            const direction = directions[action];
            if (!this.wasKeyPressed(action)) continue;
            if (direction.x + this.direction.x === 0 && direction.y + this.direction.y === 0) continue;
            this.nextDirection = direction;
        }
    }

    start() {
        if (this.status === 'gameover' || this.status === 'won') this.resetGame();
        this.status = 'playing';
        super.start();
    }

    resetGame() {
        const centerX = Math.floor(this.columns / 2);
        const centerY = Math.floor(this.rows / 2);
        this.snake = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY },
            { x: centerX - 3, y: centerY }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.stepTimer = 0;
        this.placeFood();
        this.status = 'ready';
    }

    placeFood() {
        const freeCells = [];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                if (!this.snake.some((segment) => segment.x === x && segment.y === y)) {
                    freeCells.push({ x, y });
                }
            }
        }

        this.food = freeCells[Math.floor(Math.random() * freeCells.length)];
    }

    update(deltaTime) {
        if (!this.started || this.status !== 'playing') return;

        this.stepTimer += deltaTime;
        while (this.stepTimer >= this.stepTime) {
            this.stepTimer -= this.stepTime;
            this.advanceSnake();
            if (this.status !== 'playing') break;
        }
    }

    advanceSnake() {
        this.direction = this.nextDirection;
        const head = this.snake[0];
        const nextHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        const eatsFood = nextHead.x === this.food.x && nextHead.y === this.food.y;
        const bodyToCheck = eatsFood ? this.snake : this.snake.slice(0, -1);
        const hitsWall = nextHead.x < 0 || nextHead.x >= this.columns || nextHead.y < 0 || nextHead.y >= this.rows;
        const hitsBody = bodyToCheck.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y);

        if (hitsWall || hitsBody) {
            this.status = 'gameover';
            return;
        }

        this.snake.unshift(nextHead);
        if (eatsFood) {
            this.score++;
            this.stepTime = Math.max(0.055, 0.11 - this.score * 0.002);
            if (this.snake.length === this.columns * this.rows) {
                this.status = 'won';
            } else {
                this.placeFood();
            }
        } else {
            this.snake.pop();
        }
    }

    render(context, canvas) {
        context.fillStyle = '#071a1c';
        context.fillRect(0, 0, canvas.width, canvas.height);
        this.renderBoard(context);
        this.renderFood(context);
        this.renderSnake(context);
        this.renderHud(context, canvas);

        if (this.status !== 'playing') this.renderOverlay(context, canvas);
    }

    renderBoard(context) {
        context.fillStyle = '#102d2d';
        context.fillRect(this.boardLeft, this.boardTop, this.boardWidth, this.boardHeight);
        context.strokeStyle = 'rgba(148, 163, 184, 0.08)';
        context.lineWidth = 1;

        for (let column = 0; column <= this.columns; column++) {
            const x = this.boardLeft + column * this.cellSize + 0.5;
            context.beginPath();
            context.moveTo(x, this.boardTop);
            context.lineTo(x, this.boardTop + this.boardHeight);
            context.stroke();
        }

        for (let row = 0; row <= this.rows; row++) {
            const y = this.boardTop + row * this.cellSize + 0.5;
            context.beginPath();
            context.moveTo(this.boardLeft, y);
            context.lineTo(this.boardLeft + this.boardWidth, y);
            context.stroke();
        }
    }

    renderFood(context) {
        const centerX = this.boardLeft + this.food.x * this.cellSize + this.cellSize / 2;
        const centerY = this.boardTop + this.food.y * this.cellSize + this.cellSize / 2;
        context.fillStyle = '#fb7185';
        context.beginPath();
        context.arc(centerX, centerY, this.cellSize * 0.36, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#bef264';
        context.fillRect(centerX + 3, centerY - 10, 5, 4);
    }

    renderSnake(context) {
        for (let index = this.snake.length - 1; index >= 0; index--) {
            const segment = this.snake[index];
            const inset = index === 0 ? 1 : 2;
            const x = this.boardLeft + segment.x * this.cellSize + inset;
            const y = this.boardTop + segment.y * this.cellSize + inset;
            context.fillStyle = index === 0 ? '#bef264' : '#65a30d';
            context.fillRect(x, y, this.cellSize - inset * 2, this.cellSize - inset * 2);
        }

        const head = this.snake[0];
        const headX = this.boardLeft + head.x * this.cellSize;
        const headY = this.boardTop + head.y * this.cellSize;
        context.fillStyle = '#172b16';
        const eyeOffsetX = this.direction.x === 0 ? 5 : this.direction.x * 5;
        const eyeOffsetY = this.direction.y === 0 ? 5 : this.direction.y * 5;
        context.fillRect(headX + this.cellSize / 2 + eyeOffsetX - 2, headY + this.cellSize / 2 + eyeOffsetY - 2, 4, 4);
    }

    renderHud(context, canvas) {
        context.fillStyle = '#d9f99d';
        context.font = '18px Arial';
        context.textAlign = 'left';
        context.fillText(`SCORE ${this.score}`, 20, 30);
        context.textAlign = 'right';
        context.fillText(`${this.fps} FPS`, canvas.width - 20, 30);
    }

    renderOverlay(context, canvas) {
        context.fillStyle = 'rgba(7, 26, 28, 0.78)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#f0fdf4';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '32px Arial';
        if (this.status === 'ready') context.fillText('PRESS ENTER TO START', canvas.width / 2, canvas.height / 2);
        if (this.status === 'gameover') context.fillText(`GAME OVER - SCORE ${this.score}`, canvas.width / 2, canvas.height / 2);
        if (this.status === 'won') context.fillText('YOU WIN - PRESS ENTER', canvas.width / 2, canvas.height / 2);
    }
}