import { Actor } from './Actor';
import { Class } from './Class';
import Game from './Game';
import { humanFist } from './it/weapon';
import Item from './Item';
import { Dir, Side } from './types';

export default class Player extends Actor {
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

        if (!this.natural) this.natural = new Item(g, humanFist);
    }

    levelUp() {
        this.level++;
        this.base.hpMax += this.class.hpGain;
        this.base.kiMax += this.class.kiGain;
        this.base.strength += this.class.strGain;
    }
}
