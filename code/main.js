import { BufferingMode, WindowMode } from './constants.js';
import { BreakoutGame } from './breakout-game.js';
import { CarGame } from './car-game.js';
import { DoubleDragonGame } from './double-dragon-game.js';
import { PacmanGame } from './pacman.js';
import { RacingGame } from './racing.js';
import { SnakeGame } from './snake.js';
import { TreeGame } from './tree-game.js';
import { MarioDemo } from './mario-demo.js';

const BREAKOUT = 0;
const PACMAN = 1;
const SNAKE = 2;
const RACING = 3;
const CAR = 4;
const DOUBLE_DRAGON = 5;
const TREE = 6;
const MARIO_DEMO = 7;

const config = {
    updateFPS: 60,
    renderFPS: 0,
    width: 800,
    height: 600,
    bufferingMode: BufferingMode.TRIPLE,
    windowMode: WindowMode.WINDOWED
};

const gameFactories = {
    [BREAKOUT]: () => new BreakoutGame(config),
    [PACMAN]: () => new PacmanGame(config),
    [SNAKE]: () => new SnakeGame(config),
    [RACING]: () => new RacingGame(config),
    [CAR]: () => new CarGame(config),
    [DOUBLE_DRAGON]: () => new DoubleDragonGame(config),
    [TREE]: () => new TreeGame(config),
    [MARIO_DEMO]: () => new MarioDemo(config)
};

const createGame = gameFactories[MARIO_DEMO];
if (!createGame) throw new Error('Invalid game selection');

const game = createGame();

game.initialize();

window.addEventListener('keydown', (event) => {
    if (event.key === game.keyMap.get('RESET') && !event.repeat) {
        game.reset();
    } else if (event.key === game.keyMap.get('PAUSE') && !event.repeat) {
        if (game.paused) game.resume();
        else game.pause();
    } else if (event.key === game.keyMap.get('START') && !event.repeat) {
        if (config.windowMode === WindowMode.FULLSCREEN) {
            document.documentElement.requestFullscreen();
        }
        game.start();
    }
});
