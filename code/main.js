import { BufferingMode, WindowMode } from './constants.js';
import { BreakoutGame } from './breakout-game.js';
import { CarGame } from './car-game.js';
import { PacmanGame } from './pacman.js';
import { RacingGame } from './racing.js';
import { SnakeGame } from './snake.js';

const BREAKOUT = 0;
const PACMAN = 1;
const SNAKE = 2;
const RACING = 3;
const CAR = 4;

const config = {
    fps: 60,
    width: 800,
    height: 600,
    bufferingMode: BufferingMode.DOUBLE,
    windowMode: WindowMode.WINDOWED
};

const games = [
    new BreakoutGame(config),
    new PacmanGame(config),
    new SnakeGame(config),
    new RacingGame(config),
    new CarGame(config)
];

const game = games[SNAKE];
game.initialize();

window.addEventListener('keydown', (event) => {
    if (event.key === game.keyMap.get('START') && !event.repeat) {
        game.start();
    }
});
