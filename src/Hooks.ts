import { Actor } from './Actor';
import { Floor } from './Floor';
import Game from './Game';
import Item, { WeaponTemplate } from './Item';
import { Dir, XY } from './types';

export type GameEventHandler<T extends GameEventName> = (
    e: GameEventMap[T],
) => unknown;
export type GameEventListeners = {
    [T in GameEventName]?: GameEventHandler<T>[];
};

export default class Hooks {
    listeners: GameEventListeners;

    constructor(public g: Game) {
        this.listeners = {};
    }

    on<T extends GameEventName>(type: T, fn: GameEventHandler<T>) {
        if (!this.listeners[type]) this.listeners[type] = [];

        //@ts-expect-error: dunno how to tell TS it's the right type
        this.listeners[type].push(fn);
    }

    off<T extends GameEventName>(type: T, fn: GameEventHandler<T>) {
        if (this.listeners[type]) {
            //@ts-expect-error: dunno how to tell TS it's the right type
            this.listeners[type] = this.listeners[type].filter((c) => c !== fn);
        }
    }

    fire<T extends GameEventName>(type: T, e: GameEventMap[T]) {
        this.g.t.enter('Hooks.fire', type, e);
        const callbacks = this.listeners[type];
        //@ts-expect-error: dunno how to tell TS it's the right type
        if (callbacks) callbacks.forEach((h) => h(e));
        this.g.t.leave('Hooks.fire');
    }
}

export interface GameEventMap {
    'architect.begin': GameEvent;
    'architect.end': FloorEvent;
    'enemy.hit': CombatEvent;
    'enemy.died': CombatEvent;
    'floor.enter': FloorEvent;
    'player.attack': AttackEvent;
    'player.died': CombatEvent;
    'player.hit': CombatEvent;
    'player.move': MoveEvent;
    'player.turn': TurnEvent;
    'sys.advance': AdvanceEvent;
}
export type GameEventName = keyof GameEventMap;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GameEvent {}

export interface AdvanceEvent extends GameEvent {
    time: number;
}

export interface AttackEvent extends GameEvent {
    attacker: Actor;
    victim: Actor;
    weapon: Item<WeaponTemplate>;
}

export interface CombatEvent extends GameEvent {
    attacker: Actor;
    victim: Actor;
}

export interface FloorEvent extends GameEvent {
    floor: Floor;
}

export interface MoveEvent extends GameEvent {
    actor: Actor;
    from: XY;
}

export interface TurnEvent extends GameEvent {
    actor: Actor;
    from: Dir;
}
