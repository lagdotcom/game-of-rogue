import { Actor } from './Actor';
import Game from './Game';
import Item from './Item';
import { capFirst } from './tools';
import UIElement from './UIElement';

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
        return a.name + "'s";
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

type LogMessage = { message: string; fg?: string; bg?: string };

export default class Log implements UIElement {
    logs: LogMessage[];
    y: number;

    constructor(
        public g: Game,
        public height: number = 5,
        public size: number = 10,
        public x: number = 1,
    ) {
        this.logs = [];
        this.y = g.display.height - 1;
    }

    draw() {
        let y = this.y;
        this.logs.forEach(({ message, fg, bg }) => {
            this.g.display.str(this.x, y, message, fg, bg);
            y--;
        });
    }

    private add(log: LogMessage) {
        this.logs.unshift(log);
        while (this.logs.length > this.size) this.logs.pop();
    }

    error(msg: string, ...args: LogArg[]) {
        const message = this.format(msg, ...args);
        this.add({ message, fg: 'red' });
    }

    info(msg: string, ...args: LogArg[]) {
        const message = this.format(msg, ...args);
        this.add({ message });
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
                        return (<Item>arg).name({ singular: true });
                    case 'string':
                        return <string>arg;
                    case 'number':
                        return (<number>arg).toString();
                }
            }),
        );
    }
}
