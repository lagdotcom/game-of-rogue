import { Ninja } from '../classes';
import Enemy from '../Enemy';
import Game from '../Game';
import { sai, shuriken, tanto } from '../it/weapon';
import { constructItem } from '../Item';
import { randomName } from '../names';
import { rnd } from '../tools';

export class EnemyNinja extends Enemy {
    constructor(g: Game) {
        super(g);

        this.char = 'N';
        this.name = randomName(g);
        this.apply(Ninja);
        this.investigatesNoises = true;

        if (rnd(g.rng, 4) === 0) {
            this.equip(constructItem(g, sai));
            this.equip(constructItem(g, sai));
        } else {
            this.equip(constructItem(g, tanto));
            this.equip(constructItem(g, shuriken));
        }
    }
}
