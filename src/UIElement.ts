import Game from './Game';

export default interface UIElement {
    g: Game;

    draw(): void;
}
