import { Dir, Class } from './types';
import Game from './Game';
import { AbstractActor } from './AbstractActor';

export default class Player extends AbstractActor {
    isActor: true;
    isPlayer: true;
    class: Class;

    constructor(g: Game, spec: Class) {
        super(g, 'Player');
        this.isPlayer = true;
        this.bg = '#202020';
        this.class = spec;
        this.char = '@';
        this.facing = Dir.N;
        this.fg = 'white';
        this.hp = this.hpMax = spec.hp;
        this.ki = this.kiMax = spec.ki;
        this.sightFov = 160;
        this.sightRange = 5;
        this.str = spec.str;
    }
}
