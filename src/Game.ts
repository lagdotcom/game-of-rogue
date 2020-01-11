import { Display } from './Display';
import Hooks from './Hooks';
import Architect from './Architect';
import Trace from './Trace';
import { Floor } from './Floor';
import RNG, { tychei } from './RNG';
import { Tile, Actor, Token, Dir, Traceline, XY } from './types';
import Player from './Player';
import Input from './Input';
import { getSightCone } from './lights';
import { dirOffsets } from './consts';
import { Samurai } from './classes';
import Log from './Log';

interface TileColour {
    fg: string;
    bg: string;
}

const colours: { [index: string]: TileColour } = {
    [Tile.Door]: { fg: 'brown', bg: 'black' },
    [Tile.Space]: { fg: '#404040', bg: 'black' },
    [Tile.Wall]: { fg: '#808080', bg: 'black' },
};

export default class Game {
    actors: Actor[];
    architect: Architect;
    display: Display;
    f: Floor;
    hooks: Hooks;
    input: Input;
    log: Log;
    player: Player;
    rng: RNG;
    t: Trace;

    constructor(parent: HTMLElement) {
        this.t = new Trace();
        this.t.enter('Game.new');
        this.seed();

        this.display = new Display(parent, 80, 40);
        this.display.str(0, 0, 'setting up...');

        this.actors = [];
        this.architect = new Architect(this);
        this.hooks = new Hooks(this);
        this.input = new Input(this);
        this.log = new Log(this);
        this.player = new Player(this, Samurai);

        this.t.leave('Game.new');
    }

    seed(s?: string) {
        this.rng = new tychei(s);
        this.t.message('rng seed', this.rng.getSeed());
    }

    enter(f: Floor) {
        this.t.enter('enter', f);
        this.f = f;
        this.player.pos = f.player;
        this.actors = [this.player, ...this.f.enemies];

        this.redraw();

        this.t.leave('enter');
    }

    redraw() {
        this.display.fill(' ');

        let tdraw = this.drawTile.bind(this);
        getSightCone(this.player).forEach(tdraw);
    }

    drawTile(p: XY) {
        let enemy = this.f.enemyAt(p);
        let item = this.f.itemAt(p);
        let tok: Token;

        if (this.player.pos == p) {
            tok = this.player;
        } else if (enemy) {
            tok = enemy;
        } else if (item) {
            tok = item;
        } else {
            let char = this.f.map.get(p.x, p.y);
            if (!colours[char]) return;
            tok = { ...colours[char], char };
        }

        this.display.at(p.x, p.y).set(tok.fg, tok.bg, tok.char);
    }

    contents(p: XY): Token[] {
        return [
            ...this.actors.filter(a => a.pos == p),
            ...this.f.items.filter(i => i.pos == p),
        ];
    }

    playerMove(d: Dir) {
        this.t.todo('Game.playerMove', d);

        if (this.player.facing != d) {
            this.player.facing = d;
            this.redraw();
            return;
        }

        const current = this.player.pos;
        const mod = dirOffsets[d];
        const dest = this.f.map.ref(current.x + mod.x, current.y + mod.y);
        let possible = true;
        this.contents(dest).forEach(x => {
            if (x.isActor) possible = false;
        });

        if (possible) {
            switch (this.f.map.get(dest.x, dest.y)) {
                case Tile.Door:
                case Tile.Space:
                    this.player.pos = dest;
                    this.redraw();

                default:
                // TODO: oof
            }
        }
    }

    trace(
        sx: number,
        sy: number,
        ex: number,
        ey: number,
        steps: number,
        cb: (p: XY) => boolean,
    ): Traceline {
        let tl: Traceline = {
            start: this.f.map.ref(sx, sy),
            projected: this.f.map.ref(ex, ey),
            visited: new Set<XY>(),
            end: null,
        };

        let tx = sx;
        let ty = sy;
        let dx = (ex - sx) / steps;
        let dy = (ey - sy) / steps;

        for (let s = 0; s <= steps; s++) {
            let p = this.f.map.ref(tx, ty);
            if (!tl.visited.has(p)) {
                tl.visited.add(p);

                if (!cb(p)) {
                    tl.end = p;
                    return tl;
                }
            }

            tx += dx;
            ty += dy;
        }

        return tl;
    }

    debugNewFloor() {
        this.enter(
            this.architect.generate(
                1,
                this.display.width,
                this.display.height,
                200,
            ),
        );
    }
}
