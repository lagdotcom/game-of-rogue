import { Dir } from './types';
import Game from './Game';
import { Actor } from './Actor';

export default class Enemy extends Actor {
    isActor: true;
    isEnemy: true;

    constructor(g: Game) {
        super(g, 'Enemy');
        this.isEnemy = true;
        this.bg = '#200000';
        this.char = 'E';
        this.facing = Dir.N;
        this.fg = 'red';
    }
}
