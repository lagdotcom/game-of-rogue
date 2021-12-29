import Game from './Game';
import UIElement from './UIElement';

export default class Prompt implements UIElement {
    text?: string;

    constructor(public g: Game, public x: number = 5, public y: number = 5) {}

    show(text: string) {
        this.text = text;
        this.g.redraw();
    }

    clear() {
        this.text = undefined;
        this.g.redraw();
    }

    draw() {
        if (this.text) {
            this.g.display.str(this.x, this.y, this.text, 'yellow');
        }
    }
}
