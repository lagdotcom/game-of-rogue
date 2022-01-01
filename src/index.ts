import './style.css';

import Game from './Game';

window.addEventListener('load', () => {
    const container = document.getElementById('game-container');
    if (!container) throw new Error('Could not find #game-container');

    const game = new Game(container, '300 15px "Roboto Mono", monospace');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (<any>window).G = game;

    game.debugNewFloor();
});
