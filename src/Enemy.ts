import { Dir } from './types';
import Game from './Game';
import { AbstractActor } from './AbstractActor';

export default class Enemy extends AbstractActor {
    isActor: true;
    isEnemy: true;

    constructor(g: Game) {
        super(g, 'Enemy');
        this.isEnemy = true;
        this.bg = '#200000';
        this.char = 'E';
        this.facing = Dir.N;
        this.fg = 'red';
        this.sightFov = 160;
    }
}
