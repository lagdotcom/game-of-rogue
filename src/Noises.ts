import { Actor } from './Actor';
import Game from './Game';
import { distance } from './tools';
import { XY } from './types';

export interface Noise {
    pos: XY;
    volume: number;
    source: Actor;
    ttl: number;
}

export default class Noises {
    noises: Noise[];

    constructor(public g: Game) {
        this.noises = [];

        g.hooks.on('sys.advance', () => this.tick());
        g.hooks.on('architect.begin', () => this.clear());
    }

    clear() {
        this.noises = [];
    }

    add(pos: XY, volume: number, source: Actor, duration: number) {
        this.noises.push({
            pos,
            volume,
            source,
            ttl: this.g.timer + duration,
        });
    }

    tick() {
        this.noises = this.noises.filter((n) => n.ttl > this.g.timer);
    }

    closest(a: Actor) {
        let lowest = a.hearingRange + 1;
        let closest: Noise | undefined = undefined;

        for (const n of this.noises) {
            const dist = distance(a.pos, n.pos) - n.volume;
            if (dist < lowest) {
                lowest = dist;
                closest = n;
            }
        }

        return closest;
    }
}
