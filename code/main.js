import { BufferingMode, WindowMode } from './constants.js';
import { Game } from './game.js';
import { GameRenderer } from './game-rendering.js';

const game = new Game(120, 800, 600);
const renderer = new GameRenderer(BufferingMode.DOUBLE, WindowMode.WINDOWED, 800, 600);
game.setRenderer(renderer);

renderer.render(game);

window.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.repeat) {
        game.start();
    }
});
