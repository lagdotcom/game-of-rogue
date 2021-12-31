import { Actor } from './Actor';
import { Class } from './Class';
import Game from './Game';
import { humanFist } from './it/weapon';
import { instantiateItem, Weapon } from './Item';
import { Dir, Side } from './types';

export default class Player extends Actor {
    isActor: true;
    isPlayer: true;
    class: Class;
    level: number;

    constructor(g: Game, spec: Class) {
        super(g, 'Player', Side.Player);
        this.isPlayer = true;
        this.bg = '#202020';
        this.char = '@';
        this.facing = Dir.N;
        this.fg = 'white';
        this.level = 1;

        this.class = spec;
        this.apply(spec);
        spec.init(this);

        if (!this.natural) this.natural = <Weapon>instantiateItem(g, humanFist);
    }

    levelUp() {
        this.level++;
        this.hpMax += this.class.hpGain;
        this.kiMax += this.class.kiGain;
        this.str += this.class.strGain;
    }
}
