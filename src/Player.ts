import { Dir } from './types';
import { Class } from './Class';
import Game from './Game';
import { Actor } from './Actor';

export default class Player extends Actor {
    isActor: true;
    isPlayer: true;
    class: Class;
    level: number;

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
        this.level = 1;
        this.str = spec.str;

        spec.init(this);
    }

    levelUp() {
        this.level++;
        this.hpMax += this.class.hpGain;
        this.kiMax += this.class.kiGain;
        this.str += this.class.strGain;
    }
}
