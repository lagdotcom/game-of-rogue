import Game from './Game';

window.addEventListener('load', () => {
    const game = new Game(document.getElementById('game-container'));
    (<any>window).G = game;

    game.debugNewFloor();
});
