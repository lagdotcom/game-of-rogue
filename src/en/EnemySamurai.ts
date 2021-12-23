import { Samurai } from '../classes';
import Enemy from '../Enemy';
import Game from '../Game';
import { domaru, sujibachi } from '../it/armor';
import { katana, wakizashi, ya, yumi } from '../it/weapon';
import { constructItem } from '../Item';
import { randomName } from '../names';
import { rnd } from '../tools';

export class EnemySamurai extends Enemy {
    constructor(g: Game) {
        super(g);

        this.char = 'S';
        this.name = randomName(g);
        this.hp = this.hpMax = Samurai.hp;

        if (rnd(g.rng, 4) == 0) {
            this.equip(constructItem(g, katana));
        } else if (rnd(g.rng, 3) == 0) {
            this.equip(constructItem(g, yumi));
            this.equip(constructItem(g, ya));
        } else {
            this.equip(constructItem(g, wakizashi));
        }

        if (rnd(g.rng, 3) == 0) {
            this.equip(constructItem(g, domaru));
        }

        if (rnd(g.rng, 3) == 0) {
            this.equip(constructItem(g, sujibachi));
        }
    }
}
