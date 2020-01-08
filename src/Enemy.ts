import Point from './Point';
import { Actor } from './types';
import Game from './Game';

export default class Enemy implements Actor {
    bg: string;
    char: string;
    energy: number;
    fg: string;
    g: Game;
    pos: Point;

    constructor(g: Game) {
        // TODO
        this.bg = '#200000';
        this.char = 'E';
        this.g = g;
        this.fg = 'red';
    }
}
