import { GameEventMap, GameEvent } from './types';
import Game from './Game';

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
