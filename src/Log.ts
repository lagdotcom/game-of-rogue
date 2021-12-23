import { Actor } from './Actor';
import Game from './Game';
import { capFirst } from './tools';

const argLookup = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
};

export default class Log {
    g: Game;

    constructor(g: Game) {
        this.g = g;
    }

    error(msg: string, ...args: any[]) {
        this.g.t.todo('Log.error', msg, args);
        this.g.t.message(this.format(msg, ...args));
    }

    info(msg: string, ...args: any[]) {
        this.g.t.todo('Log.info', msg, args);
        this.g.t.message(this.format(msg, ...args));
    }

    format(msg: string, ...args: any[]) {
        return capFirst(
            msg.replace(/%../g, (pat) => {
                const arg = args[argLookup[pat[1]]];
                const a = <Actor>arg;
                let sub = pat;

                switch (pat[2]) {
                    case 'n':
                        if (a.isPlayer) sub = 'you';
                        else if (a.cloneOf == this.g.player) sub = 'your clone';
                        else sub = a.name;
                        break;

                    case 'o':
                        if (a.isPlayer) sub = 'your';
                        else if (a.cloneOf == this.g.player)
                            sub = "your clone's";
                        else sub = a.name + "'s";
                        break;

                    case 'r':
                        if (a.isPlayer) sub = 'your';
                        else sub = 'their';
                        break;

                    case 's':
                        if (a.isPlayer) sub = '';
                        else sub = 's';
                        break;

                    case '#':
                        sub = arg.toString();
                        break;
                }

                return sub;
            }),
        );
    }
}
