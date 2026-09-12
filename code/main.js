import { BufferingMode, WindowMode } from './constants.js';
import { Game } from './game.js';

const game = new Game(BufferingMode.DOUBLE, WindowMode.WINDOWED, 120, 800, 600);

window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.repeat) {
        game.start();
    }
});
