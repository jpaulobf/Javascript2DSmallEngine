import { BufferingMode, WindowMode } from './constants.js';
import { SnakeGame } from './snake.js';

const config = {
    fps: 60,
    width: 800,
    height: 600,
    bufferingMode: BufferingMode.DOUBLE,
    windowMode: WindowMode.WINDOWED
};

const game = new SnakeGame(config);
game.initialize();

window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.repeat) {
        game.start();
    }
});
