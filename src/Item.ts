import { Token, XY } from './types';
import Game from './Game';

export default class Item implements Token {
    isItem: true;
    bg: string;
    char: string;
    fg: string;
    g: Game;
    pos: XY;

    constructor(g: Game) {
        // TODO
        this.isItem = true;
        this.bg = '#202000';
        this.char = '$';
        this.fg = 'yellow';
        this.g = g;
    }
}
