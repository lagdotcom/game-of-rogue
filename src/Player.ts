import { Actor } from './Actor';
import { Class } from './Class';
import Game from './Game';
import { humanFists } from './it/weapon';
import { instantiateItem, Weapon } from './Item';
import { Dir } from './types';

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
        if (!this.natural)
            this.natural = <Weapon>instantiateItem(g, humanFists);
    }

    levelUp() {
        this.level++;
        this.hpMax += this.class.hpGain;
        this.kiMax += this.class.kiGain;
        this.str += this.class.strGain;
    }
}
