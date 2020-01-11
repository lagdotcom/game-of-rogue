import Enemy from '../Enemy';
import Game from '../Game';
import { rnd } from '../tools';
import { constructItem } from '../Item';
import { katana, yumi, ya, wakizashi } from '../it/weapon';
import { domaru, sujibachi } from '../it/armor';

export class EnemySamurai extends Enemy {
    constructor(g: Game) {
        super(g);

        this.char = 'S';

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
