import { Actor } from './Actor';
import Game from './Game';
import Item from './Item';
import { capFirst } from './tools';

const argLookup = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
};

type LogArg = Actor | Item | number | string;
function getArgType(a: LogArg) {
    if (a instanceof Actor) return 'actor';
    if (a instanceof Item) return 'item';
    if (typeof a === 'string') return 'string';
    return 'number';
}

type FormatterChar = 'n' | 'o' | 'r' | 's' | '#';
type FormatterMatrix<T> = { [K in FormatterChar]: (obj: T) => string };

const actorFormatters: FormatterMatrix<Actor> = {
    n: (a) => {
        if (a.isPlayer) return 'you';
        if (a.cloneOf === a.g.player) return 'your clone';
        return a.name;
    },
    o: (a) => {
        if (a.isPlayer) return 'your';
        if (a.cloneOf === a.g.player) return "your clone's";
        return a.name + 's';
    },
    r: (a) => {
        if (a.isPlayer) return 'your';
        return 'their';
    },
    s: (a) => {
        if (a.isPlayer) return '';
        return 's';
    },
    '#': (a) => a.name,
};

export default class Log {
    g: Game;

    constructor(g: Game) {
        this.g = g;
    }

    error(msg: string, ...args: LogArg[]) {
        this.g.t.todo('Log.error', msg, args);
        this.g.t.message(this.format(msg, ...args));
    }

    info(msg: string, ...args: LogArg[]) {
        this.g.t.todo('Log.info', msg, args);
        this.g.t.message(this.format(msg, ...args));
    }

    format(msg: string, ...args: LogArg[]) {
        return capFirst(
            msg.replace(/%../g, (pat) => {
                const ch = pat[2];
                const arg = args[argLookup[pat[1]]];

                switch (getArgType(arg)) {
                    case 'actor':
                        return actorFormatters[ch](<Actor>arg);
                    case 'item':
                        return (<Item>arg).name();
                    case 'string':
                        return <string>arg;
                    case 'number':
                        return (<number>arg).toString();
                }
            }),
        );
    }
}
