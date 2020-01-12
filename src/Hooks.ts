import Game from './Game';
import { Floor } from './Floor';
import { Actor } from './Actor';
import { Weapon } from './Item';

// TODO: type Handler<T extends keyof GameEventMap> = (e: GameEventMap[T]) => any;
type Handler = (e: GameEvent) => any;

export default class Hooks {
    g: Game;
    listeners: {
        [type in keyof GameEventMap]?: Handler[];
    };

    constructor(g: Game) {
        this.g = g;
        this.listeners = {};
    }

    on<T extends keyof GameEventMap>(type: T, fn: Handler) {
        if (!this.listeners[type]) this.listeners[type] = [];

        this.listeners[type].push(fn);
    }

    off<T extends keyof GameEventMap>(type: T, fn: Handler) {
        if (this.listeners[type])
            this.listeners[type] = this.listeners[type].filter(c => c !== fn);
    }

    fire<T extends keyof GameEventMap>(type: T, e: GameEventMap[T]) {
        this.g.t.enter('Hooks.fire', type, e);
        if (this.listeners[type]) this.listeners[type].forEach(h => h(e));
        this.g.t.leave('Hooks.fire');
    }
}

export interface GameEventMap {
    'architect.begin': GameEvent;
    'architect.end': FloorEvent;
    'floor.enter': FloorEvent;
    'player.attack': AttackEvent;
    'player.move': GameEvent;
    'player.turn': GameEvent;
}

export interface GameEvent {}

export interface FloorEvent extends GameEvent {
    floor: Floor;
}

export interface AttackEvent extends GameEvent {
    attacker: Actor;
    victim: Actor;
    weapon: Weapon;
}
