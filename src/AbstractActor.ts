import { Actor, Dir, XY } from './types';
import Game from './Game';
import Item from './Item';

export abstract class AbstractActor implements Actor {
    balance: number;
    balanceMax: number;
    bg: string;
    char: string;
    nextmove: number;
    facing: Dir;
    fg: string;
    g: Game;
    hp: number;
    hpMax: number;
    isActor: true;
    isEnemy?: true;
    isPlayer?: true;
    ki: number;
    kiMax: number;
    name: string;
    pos: XY;
    sightFov: number;
    sightRange: number;
    str: number;

    constructor(g: Game, name: string) {
        this.g = g;
        this.isActor = true;
        this.balance = this.balanceMax = 100;
        this.name = name;
    }

    spend(t: number) {
        this.nextmove -= t;
        this.g.actors.sort((a, b) => a.nextmove - b.nextmove);
    }

    equip(i: Item) {
        this.g.t.todo('Actor.equip', i);
    }
}
