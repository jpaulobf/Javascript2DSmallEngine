import { Game } from './game.js';

export class PacmanGame extends Game {

    init() {
        this.cellSize = 20;
        this.columns = 28;
        this.rows = 21;
        this.boardWidth = this.columns * this.cellSize;
        this.boardHeight = this.rows * this.cellSize;
        this.boardLeft = (this.width - this.boardWidth) / 2;
        this.boardTop = (this.height - this.boardHeight) / 2 + 12;
        this.stepTime = 0.12;
        this.stepTimer = 0;
        this.status = 'ready';
        this.keyDownHandler = (event) => this.handleKeyDown(event);
        window.addEventListener('keydown', this.keyDownHandler);
        this.resetGame();
    }

    handleKeyDown(event) {
        const directions = {
            ArrowUp: { x: 0, y: -1 },
            w: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            s: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            a: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 },
            d: { x: 1, y: 0 }
        };
        const direction = directions[event.key] || directions[event.key.toLowerCase()];
        if (!direction) return;
        event.preventDefault();
        this.nextDirection = direction;
    }

    start() {
        if (this.status === 'gameover' || this.status === 'won') this.resetGame();
        this.status = 'playing';
        super.start();
    }

    resetGame() {
        this.maze = this.createMaze();
        this.pacman = { x: 14, y: 15 };
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.score = 0;
        this.lives = 3;
        this.stepTimer = 0;
        this.frightenedTimer = 0;
        this.createGhosts();
        this.status = 'ready';
    }

    createMaze() {
        const maze = Array.from({ length: this.rows }, (_, y) =>
            Array.from({ length: this.columns }, (_, x) => (x === 0 || x === this.columns - 1 || y === 0 || y === this.rows - 1 ? '#' : '.'))
        );

        const horizontalWalls = [
            [2, 2, 6], [2, 9, 12], [2, 15, 18], [2, 21, 25],
            [5, 2, 5], [5, 8, 12], [5, 15, 19], [5, 22, 25],
            [8, 3, 10], [8, 17, 24],
            [12, 3, 10], [12, 17, 24],
            [15, 2, 5], [15, 8, 12], [15, 15, 19], [15, 22, 25],
            [18, 2, 6], [18, 9, 12], [18, 15, 18], [18, 21, 25]
        ];
        const verticalWalls = [
            [4, 4, 6], [4, 21, 17], [7, 4, 6], [7, 21, 17],
            [10, 3, 5], [10, 22, 5], [13, 3, 5], [13, 22, 5],
            [16, 4, 6], [16, 21, 17]
        ];

        for (const [row, start, end] of horizontalWalls) {
            for (let column = start; column <= end; column++) maze[row][column] = '#';
        }
        for (const [column, start, length] of verticalWalls) {
            for (let offset = 0; offset < length; offset++) {
                const row = start + offset;
                if (row > 0 && row < this.rows - 1) maze[row][column] = '#';
            }
        }

        maze[15][14] = '.';
        maze[15][13] = '.';
        maze[10][13] = '.';
        maze[10][14] = '.';
        maze[10][12] = '.';
        maze[10][15] = '.';
        maze[1][1] = 'o';
        maze[1][26] = 'o';
        maze[19][1] = 'o';
        maze[19][26] = 'o';
        return maze;
    }

    createGhosts() {
        this.ghosts = [
            { x: 13, y: 10, color: '#ef4444', direction: { x: 1, y: 0 } },
            { x: 14, y: 10, color: '#f472b6', direction: { x: -1, y: 0 } },
            { x: 12, y: 10, color: '#22d3ee', direction: { x: 0, y: -1 } },
            { x: 15, y: 10, color: '#fb923c', direction: { x: 0, y: 1 } }
        ];
    }

    update(deltaTime) {
        if (!this.started || this.status !== 'playing') return;
        this.stepTimer += deltaTime;
        while (this.stepTimer >= this.stepTime) {
            this.stepTimer -= this.stepTime;
            this.advanceGame();
            if (this.status !== 'playing') break;
        }
        this.frightenedTimer = Math.max(0, this.frightenedTimer - deltaTime);
    }

    advanceGame() {
        if (this.canMove(this.pacman, this.nextDirection)) this.direction = this.nextDirection;
        if (this.canMove(this.pacman, this.direction)) {
            this.pacman.x += this.direction.x;
            this.pacman.y += this.direction.y;
        }

        this.consumePellet();
        for (const ghost of this.ghosts) this.moveGhost(ghost);
        this.checkGhostCollisions();
    }

    canMove(position, direction) {
        if (direction.x === 0 && direction.y === 0) return false;
        const x = position.x + direction.x;
        const y = position.y + direction.y;
        return x >= 0 && x < this.columns && y >= 0 && y < this.rows && this.maze[y][x] !== '#';
    }

    consumePellet() {
        const tile = this.maze[this.pacman.y][this.pacman.x];
        if (tile !== '.' && tile !== 'o') return;
        this.maze[this.pacman.y][this.pacman.x] = ' ';
        this.score += tile === 'o' ? 50 : 10;
        if (tile === 'o') this.frightenedTimer = 8;

        const remainingPellets = this.maze.some((row) => row.some((cell) => cell === '.' || cell === 'o'));
        if (!remainingPellets) this.status = 'won';
    }

    moveGhost(ghost) {
        const choices = this.getAvailableDirections(ghost).filter((direction) =>
            direction.x !== -ghost.direction.x || direction.y !== -ghost.direction.y
        );
        if (choices.length === 0) return;

        choices.sort((first, second) => this.getGhostDistance(ghost, first) - this.getGhostDistance(ghost, second));
        const selected = this.frightenedTimer > 0 && Math.random() < 0.65
            ? choices[Math.floor(Math.random() * choices.length)]
            : choices[0];
        ghost.direction = selected;
        ghost.x += selected.x;
        ghost.y += selected.y;
    }

    getAvailableDirections(ghost) {
        const directions = [
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 0 }
        ];
        return directions.filter((direction) => this.canMove(ghost, direction));
    }

    getGhostDistance(ghost, direction) {
        const x = ghost.x + direction.x;
        const y = ghost.y + direction.y;
        const distanceX = Math.abs(this.pacman.x - x);
        const distanceY = Math.abs(this.pacman.y - y);
        return this.frightenedTimer > 0 ? -(distanceX + distanceY) : distanceX + distanceY;
    }

    checkGhostCollisions() {
        for (const ghost of this.ghosts) {
            if (ghost.x !== this.pacman.x || ghost.y !== this.pacman.y) continue;
            if (this.frightenedTimer > 0) {
                this.score += 200;
                ghost.x = 14;
                ghost.y = 10;
                ghost.direction = { x: 1, y: 0 };
            } else {
                this.lives--;
                if (this.lives === 0) {
                    this.status = 'gameover';
                } else {
                    this.pacman = { x: 14, y: 15 };
                    this.direction = { x: 0, y: 0 };
                    this.nextDirection = { x: 0, y: 0 };
                    this.createGhosts();
                }
                return;
            }
        }
    }

    render(context, canvas) {
        context.fillStyle = '#050816';
        context.fillRect(0, 0, canvas.width, canvas.height);
        this.renderMaze(context);
        this.renderPacman(context);
        this.renderGhosts(context);
        this.renderHud(context, canvas);
        if (this.status !== 'playing') this.renderOverlay(context, canvas);
    }

    renderMaze(context) {
        for (let row = 0; row < this.rows; row++) {
            for (let column = 0; column < this.columns; column++) {
                const tile = this.maze[row][column];
                const x = this.boardLeft + column * this.cellSize;
                const y = this.boardTop + row * this.cellSize;
                if (tile === '#') {
                    context.fillStyle = '#172554';
                    context.fillRect(x, y, this.cellSize, this.cellSize);
                    context.strokeStyle = '#2563eb';
                    context.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                } else if (tile === '.' || tile === 'o') {
                    context.fillStyle = '#fef3c7';
                    context.beginPath();
                    context.arc(x + this.cellSize / 2, y + this.cellSize / 2, tile === 'o' ? 5 : 2, 0, Math.PI * 2);
                    context.fill();
                }
            }
        }
    }

    renderPacman(context) {
        const centerX = this.boardLeft + this.pacman.x * this.cellSize + this.cellSize / 2;
        const centerY = this.boardTop + this.pacman.y * this.cellSize + this.cellSize / 2;
        const angle = Math.atan2(this.direction.y, this.direction.x);
        const mouth = this.direction.x === 0 && this.direction.y === 0 ? 0.15 : 0.28;
        context.fillStyle = '#facc15';
        context.beginPath();
        context.moveTo(centerX, centerY);
        context.arc(centerX, centerY, this.cellSize * 0.43, angle + mouth, angle - mouth + Math.PI * 2);
        context.closePath();
        context.fill();
    }

    renderGhosts(context) {
        for (const ghost of this.ghosts) {
            const x = this.boardLeft + ghost.x * this.cellSize;
            const y = this.boardTop + ghost.y * this.cellSize;
            const centerX = x + this.cellSize / 2;
            const color = this.frightenedTimer > 0 ? '#2563eb' : ghost.color;
            context.fillStyle = color;
            context.beginPath();
            context.arc(centerX, y + 9, 8, Math.PI, 0);
            context.lineTo(x + 18, y + 18);
            context.lineTo(x + 14, y + 15);
            context.lineTo(x + 10, y + 18);
            context.lineTo(x + 6, y + 15);
            context.lineTo(x + 2, y + 18);
            context.closePath();
            context.fill();
            context.fillStyle = '#f8fafc';
            context.fillRect(x + 5, y + 7, 4, 5);
            context.fillRect(x + 11, y + 7, 4, 5);
            context.fillStyle = '#111827';
            context.fillRect(x + 6, y + 9, 2, 3);
            context.fillRect(x + 12, y + 9, 2, 3);
        }
    }

    renderHud(context, canvas) {
        context.fillStyle = '#fef3c7';
        context.font = '18px Arial';
        context.textAlign = 'left';
        context.fillText(`SCORE ${this.score}`, 20, 30);
        context.fillText(`LIVES ${this.lives}`, 20, 54);
        context.textAlign = 'right';
        context.fillText(`${this.fps} FPS`, canvas.width - 20, 30);
    }

    renderOverlay(context, canvas) {
        context.fillStyle = 'rgba(5, 8, 22, 0.78)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#f8fafc';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '32px Arial';
        if (this.status === 'ready') context.fillText('PRESS ENTER TO START', canvas.width / 2, canvas.height / 2);
        if (this.status === 'gameover') context.fillText(`GAME OVER - SCORE ${this.score}`, canvas.width / 2, canvas.height / 2);
        if (this.status === 'won') context.fillText('MAZE CLEARED - PRESS ENTER', canvas.width / 2, canvas.height / 2);
    }
}