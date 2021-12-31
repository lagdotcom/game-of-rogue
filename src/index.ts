import './style.css';

import Game from './Game';

window.addEventListener('load', () => {
    const game = new Game(
        document.getElementById('game-container'),
        '300 15px "Roboto Mono", monospace',
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any>window).G = game;

    game.debugNewFloor();
});
