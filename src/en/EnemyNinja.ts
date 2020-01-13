import Enemy from '../Enemy';
import Game from '../Game';
import { rnd } from '../tools';
import { constructItem } from '../Item';
import { sai, tanto, shuriken } from '../it/weapon';
import { namegen } from '../names';

export class EnemyNinja extends Enemy {
    constructor(g: Game) {
        super(g);

        this.char = 'N';
        this.name = namegen(g);

        if (rnd(g.rng, 4) == 0) {
            this.equip(constructItem(g, sai));
            this.equip(constructItem(g, sai));
        } else {
            this.equip(constructItem(g, tanto));
            this.equip(constructItem(g, shuriken));
        }
    }
}