import Game from './Game';

window.addEventListener('load', () => {
    let game = new Game(document.body);

    (<any>window).G = game;
});
