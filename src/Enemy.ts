import { Actor } from './Actor';
import { normalAI } from './AI';
import Game from './Game';
import { Dir, Side } from './types';

export default class Enemy extends Actor {
    isActor: true;
    isEnemy: true;

    constructor(g: Game) {
        super(g, 'Enemy', Side.Enemy);
        this.ai = normalAI.bind(this);
        this.isEnemy = true;
        this.bg = '#200000';
        this.char = 'E';
        this.facing = Dir.N;
        this.fg = 'red';
    }
}
