import { Samurai } from '../classes';
import Enemy from '../Enemy';
import Game from '../Game';
import { doMaru, sujiBachi } from '../it/armor';
import { katana, wakizashi, ya, yumi } from '../it/weapon';
import { constructItem } from '../Item';
import { randomName } from '../names';
import { rnd } from '../tools';

export class EnemySamurai extends Enemy {
    constructor(g: Game) {
        super(g);

        this.char = 'S';
        this.name = randomName(g);
        this.apply(Samurai);
        this.aiTraits.investigatesNoises = true;
        this.aiTraits.yellsOnSight = 5;

        if (rnd(g.rng, 4) === 0) {
            this.equip(constructItem(g, katana));
        } else if (rnd(g.rng, 3) === 0) {
            this.equip(constructItem(g, yumi));
            this.equip(constructItem(g, ya));
        } else {
            this.equip(constructItem(g, wakizashi));
        }

        if (rnd(g.rng, 3) === 0) {
            this.equip(constructItem(g, doMaru));
        }

        if (rnd(g.rng, 3) === 0) {
            this.equip(constructItem(g, sujiBachi));
        }
    }
}
