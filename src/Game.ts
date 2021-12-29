import { Actor } from './Actor';
import Architect from './Architect';
import { Samurai } from './classes';
import { attack } from './combat';
import { dirOffsets } from './constants';
import { Display } from './Display';
import { Floor } from './Floor';
import Hooks from './Hooks';
import Input from './Input';
import { getSightCone } from './lights';
import Log from './Log';
import Player from './Player';
import PlayerUI from './PlayerUI';
import Prompt from './Prompt';
import RNG, { tychei } from './RNG';
import { getDistanceBetween } from './tools';
import Trace from './Trace';
import { Traceline } from './Traceline';
import { Dir, Tile, Token, XY } from './types';
import UIElement from './UIElement';

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
    drawTimeout: number;
    f: Floor;
    hooks: Hooks;
    input: Input;
    log: Log;
    player: Player;
    playerUI: PlayerUI;
    prompt: Prompt;
    rng: RNG;
    t: Trace;
    timer: number;
    ui: UIElement[];

    constructor(public parent: HTMLElement, public font: string) {
        this.t = new Trace();
        this.t.enter('Game.new');
        this.seed();
        this.draw = this.draw.bind(this);

        this.display = new Display(parent, 100, 40, 12, 16, font);
        this.display.str(0, 0, 'setting up...');

        document.fonts.load(font).then(() => {
            // this.t.message('console font loaded, redrawing');
            this.redraw();
        });

        this.actors = [];
        this.architect = new Architect(this);
        this.hooks = new Hooks(this);
        this.input = new Input(this);
        this.log = new Log(this);
        this.player = new Player(this, Samurai);
        this.playerUI = new PlayerUI(this);
        this.prompt = new Prompt(this);
        this.timer = 0;
        this.ui = [this.playerUI, this.log, this.prompt];

        this.hooks.on('sys.advance', ({ time }) => {
            this.timer += time;
            this.actors.forEach((a) => a.regen(time));
        });

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
        this.input.listening = true;

        this.t.leave('enter');
    }

    remove(x: Actor) {
        const notMe = (a: Actor) => a !== x;
        this.actors = this.actors.filter(notMe);
        this.f.enemies = this.f.enemies.filter(notMe);
    }

    advance(time: number) {
        this.input.listening = false;
        this.hooks.fire('sys.advance', { time });

        while (!this.input.listening) {
            // TODO what
            if (this.player.dead) break;

            this.actors.sort((a, b) => a.nextMove - b.nextMove);

            const a = this.actors[0];
            if (a.isPlayer) {
                this.input.listening = true;
                return;
            }

            const oldMove = a.nextMove;
            a.ai();
            if (a.nextMove === oldMove) a.nextMove = this.player.nextMove + 0.5;
        }
    }

    redraw() {
        if (!this.drawTimeout)
            this.drawTimeout = requestAnimationFrame(this.draw);
    }

    draw() {
        this.drawTimeout = 0;
        this.display.fill(' ');

        const draw = this.drawTile.bind(this);
        getSightCone(this.player).forEach(draw);

        this.ui.forEach((u) => u.draw());
        this.display.update();
    }

    drawTile(p: XY) {
        const enemy = this.f.enemyAt(p);
        const item = this.f.itemAt(p);
        let tok: Token;

        if (this.player.pos == p) {
            tok = this.player;
        } else if (enemy) {
            tok = enemy;
        } else if (item) {
            tok = item.token;
        } else {
            const char = this.f.map.get(p.x, p.y);
            if (!colours[char]) return;
            tok = { ...colours[char], char };
        }

        this.display.at(p.x, p.y).set(tok);
    }

    blockers(p: XY) {
        return this.actors.filter((a) => a.pos == p);
    }

    playerAct(d: Dir) {
        if (this.player.facing != d) return this.player.turn(d, true);

        const o = dirOffsets[d];
        const dest = this.f.map.ref(
            this.player.pos.x + o.x,
            this.player.pos.y + o.y,
        );
        const b = this.blockers(dest);
        if (!b.length) return this.player.move(dest, true);

        return attack(this.player, b[0]);
    }

    playerMove(d: Dir) {
        const result = this.playerAct(d);
        return result;
    }

    trace(
        sx: number,
        sy: number,
        ex: number,
        ey: number,
        steps: number,
        cb: (p: XY) => boolean,
    ): Traceline {
        const tl: Traceline = {
            start: this.f.map.ref(sx, sy),
            projected: this.f.map.ref(ex, ey),
            visited: new Set<XY>(),
            end: null,
        };

        let tx = sx;
        let ty = sy;
        const dx = (ex - sx) / steps;
        const dy = (ey - sy) / steps;

        for (let s = 0; s <= steps; s++) {
            const p = this.f.map.ref(tx, ty);
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

    getNearestEnemy(a: Actor) {
        let best: Actor | undefined = undefined;
        let bestDistance = Infinity;

        this.actors.forEach((v) => {
            if (v.side === a.side) return;

            const dist = getDistanceBetween(a.pos, v.pos);
            if (dist < bestDistance) {
                bestDistance = dist;
                best = v;
            }
        });

        return best;
    }

    debugNewFloor() {
        this.enter(
            this.architect.generate(
                1,
                this.display.width - this.playerUI.width,
                this.display.height,
                200,
            ),
        );
    }

    debugShowAll() {
        for (let y = 0; y < this.f.map.height; y++)
            for (let x = 0; x < this.f.map.width; x++)
                this.drawTile(this.f.map.ref(x, y));

        this.display.update();
    }
}
