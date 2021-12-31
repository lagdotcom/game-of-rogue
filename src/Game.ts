import { Actor } from './Actor';
import Architect from './Architect';
import { initClasses, Monk, Ninja, Samurai } from './classes';
import { attack } from './combat';
import { Display } from './Display';
import Enemy from './Enemy';
import { Floor } from './Floor';
import Hooks from './Hooks';
import Input from './Input';
import { getSightCone } from './lights';
import Log from './Log';
import Noises from './Noises';
import Player from './Player';
import PlayerUI from './PlayerUI';
import Prompt from './Prompt';
import RNG, { tychei } from './RNG';
import { swapPositionWithClone } from './sk/Clone';
import { Skill } from './Skill';
import { oneOf } from './tools';
import Trace from './Trace';
import { Traceline } from './Traceline';
import { AIState, Dir, Tile, Token, XY } from './types';
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
    noise: Noises;
    player: Player;
    playerUI: PlayerUI;
    prompt: Prompt;
    rng: RNG;
    seen: Set<XY>;
    t: Trace;
    timer: number;
    ui: UIElement[];
    view: Set<XY>;

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
        this.noise = new Noises(this);
        this.player = new Player(this, oneOf(this.rng, [Samurai, Ninja, Monk]));
        this.playerUI = new PlayerUI(this);
        this.prompt = new Prompt(this);
        this.timer = 0;
        this.ui = [this.playerUI, this.log, this.prompt];

        this.hooks.on('sys.advance', ({ time }) => {
            this.timer += time;
            this.actors.forEach((a) => a.regen(time));
        });
        initClasses(this);

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

        if (f.floor === 1)
            this.log.coloured(
                'purple',
                `Welcome to the Game of Rogue, young ${this.player.class.name}.`,
            );

        this.seen = new Set<XY>();
        this.redraw();
        this.input.listening = true;

        this.t.leave('enter');
    }

    add(x: Enemy) {
        this.actors.push(x);
        this.f.enemies.push(x);
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
        this.display.clear();

        this.view = getSightCone(this.player);
        this.view.forEach((pos) => this.seen.add(pos));

        this.seen.forEach((p) => {
            if (this.view.has(p)) this.drawTile(p);
            else this.drawSeenTile(p);
        });

        this.ui.forEach((u) => u.draw());
        this.display.update();
        this.display.clearBorders();
    }

    drawTile(p: XY) {
        const cell = this.display.at(p.x, p.y);
        const enemy = this.f.enemyAt(p);
        const item = this.f.itemAt(p);
        let tok: Token;

        if (this.player.pos === p) {
            tok = this.player;
        } else if (enemy) {
            tok = enemy;

            if (enemy.aiState === AIState.Angry) {
                if (enemy.target === this.player) cell.border('red');
                else cell.border('orange');
            } else if (enemy.aiState === AIState.Investigating) {
                cell.border('yellow');
            }
        } else if (item) {
            tok = item.token;
        } else {
            const char = this.f.map.get(p.x, p.y);
            if (!colours[char]) return;
            tok = { ...colours[char], char };
        }

        cell.set(tok);
    }

    drawSeenTile(p: XY) {
        const item = this.f.itemAt(p);
        const tok: Token = { char: '?', fg: '#222', bg: 'black' };

        if (this.player.pos === p) {
            tok.char = this.player.char;
        } else if (item) {
            tok.char = item.token.char;
            tok.fg = '#444';
        } else {
            tok.char = this.f.map.get(p.x, p.y);
        }

        this.display.at(p.x, p.y).set(tok);
    }

    blockers(p: XY) {
        return this.actors.filter((a) => a.pos === p);
    }

    playerAct(d: Dir) {
        if (this.player.facing !== d) return this.player.turn(d, true);

        const dest = this.f.map.addFacing(this.player.pos, d);
        const blockers = this.blockers(dest);
        if (blockers.length) {
            const b = blockers[0];
            if (b.cloneOf === this.player) {
                swapPositionWithClone(this.player, b);
                return true;
            }

            return attack(this.player, b);
        }

        return this.player.move(dest, true);
    }

    playerMove(d: Dir): true {
        this.playerAct(d);
        return true;
    }

    playerSkill(sk: Skill) {
        if (!this.player.skills.includes(sk.name))
            return this.log.error("You don't know that skill.");

        if (this.player.ki < sk.ki)
            return this.log.error('Your ki is too low.');

        if (this.player.balance < sk.balance)
            return this.log.error('Your balance is off.');

        sk.fn(this.player);
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

    debugNewFloor(): true {
        this.player = new Player(this, oneOf(this.rng, [Samurai, Ninja, Monk]));

        this.enter(
            this.architect.generate(
                1,
                this.display.width - this.playerUI.width,
                this.display.height,
                200,
            ),
        );

        return true;
    }

    debugShowAll(): true {
        for (let y = 0; y < this.f.map.height; y++)
            for (let x = 0; x < this.f.map.width; x++)
                this.drawTile(this.f.map.ref(x, y));

        this.display.update();
        return true;
    }
}
