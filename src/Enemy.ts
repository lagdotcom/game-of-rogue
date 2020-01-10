import { Actor, Dir, XY } from './types';
import Game from './Game';

export default class Enemy implements Actor {
    bg: string;
    char: string;
    energy: number;
    facing: Dir;
    fg: string;
    fov: number;
    g: Game;
    pos: XY;
    sight: number;

    constructor(g: Game) {
        this.bg = '#200000';
        this.char = 'E';
        this.facing = Dir.North;
        this.fg = 'red';
        this.fov = 160;
        this.g = g;
    }
}
