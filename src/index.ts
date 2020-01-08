import Game from './Game';

window.addEventListener('load', () => {
    let game = new Game(document.body);
    (<any>window).G = game;

    let genFloorBtn = document.createElement('button');
    genFloorBtn.innerText = 'Generate Floor';
    genFloorBtn.addEventListener('click', () => {
        game.showAll(
            game.architect.generate(
                game.display.width,
                game.display.height,
                200,
            ),
        );
    });
    document.body.append(genFloorBtn);
});
