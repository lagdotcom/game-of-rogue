import Game from './Game';

window.addEventListener('load', () => {
    let game = new Game(document.getElementById('game-container'));
    (<any>window).G = game;

    game.debugNewFloor();
});
