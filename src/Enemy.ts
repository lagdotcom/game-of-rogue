import { Actor } from './Actor';
import { normalAI } from './AI';
import Game from './Game';
import { oneOf } from './tools';
import { Dir, Side } from './types';

export default class Enemy extends Actor {
    constructor(g: Game) {
        super(g, 'Enemy', Side.Enemy);
        this.ai = normalAI.bind(this);
        this.isEnemy = true;
        this.bg = '#200000';
        this.char = 'E';
        this.facing = oneOf(g.rng, [Dir.N, Dir.E, Dir.S, Dir.W]);
        this.fg = 'red';
    }
}
