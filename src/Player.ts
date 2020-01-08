import { Actor } from './types';
import Point from './Point';
import Game from './Game';

export default class Player implements Actor {
    bg: string;
    char: string;
    energy: number;
    g: Game;
    fg: string;
    pos: Point;

    constructor(g: Game) {
        this.bg = '#202020';
        this.char = '@';
        this.g = g;
        this.fg = 'white';
    }
}
