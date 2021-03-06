import { Actor } from './Actor';
import Architect from './Architect';
import { initClasses, Monk, Ninja, Samurai } from './classes';
import { colourItems } from './colours';
import { attack } from './combat';
import { Display } from './Display';
import Enemy from './Enemy';
import { Floor } from './Floor';
import Hooks from './Hooks';
import Input from './Input';
import { initItems } from './Item';
import { getSightCone } from './lights';
import Log from './Log';
import Noises from './Noises';
import Player from './Player';
import PlayerUI from './PlayerUI';
import Prompt from './Prompt';
import RNG, { tychei } from './RNG';
import { swapPositionWithClone } from './sk/Clone';
import { Skill } from './Skill';
import { niceListJoin, oneOf } from './tools';
import Trace from './Trace';
import { Traceline } from './Traceline';
import { AIState, Dir, ItemType, Tile, Token, XY } from './types';
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
    f!: Floor;
    hooks: Hooks;
    input: Input;
    log: Log;
    noise: Noises;
    player: Player;
    playerUI: PlayerUI;
    prompt: Prompt;
    rng!: RNG;
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

        this.display = new Display(parent, 90, 40, 14, 18, font);
        this.display.str(0, 0, 'setting up...');

        document.fonts.load(font).then(() => {
            // this.t.message('console font loaded, redrawing');
            this.redraw();
        });

        this.actors = [];
        this.architect = new Architect(this);
        this.drawTimeout = 0;
        this.hooks = new Hooks(this);
        this.input = new Input(this);
        this.log = new Log(this);
        this.noise = new Noises(this);
        this.player = new Player(this, oneOf(this.rng, [Samurai, Ninja, Monk]));
        this.playerUI = new PlayerUI(this);
        this.prompt = new Prompt(this);
        this.seen = new Set();
        this.timer = 0;
        this.ui = [this.playerUI, this.log, this.prompt];
        this.view = new Set();

        this.hooks.on('sys.advance', ({ time }) => {
            this.timer += time;
            this.actors.forEach((a) => a.regen(time));
        });
        initClasses(this);
        initItems(this);

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

        this.seen.clear();
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
        let dir: Dir | undefined;

        if (this.player.pos === p) {
            tok = this.player;
            dir = this.player.facing;
        } else if (enemy) {
            tok = enemy;
            dir = enemy.facing;

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

        cell.set(tok, dir);
    }

    drawSeenTile(p: XY) {
        const item = this.f.itemAt(p);
        const tok: Token = { char: '?', fg: '#222', bg: 'black' };
        let dir: Dir | undefined;

        if (this.player.pos === p) {
            tok.char = this.player.char;
            dir = this.player.facing;
        } else if (item) {
            tok.char = item.token.char;
            tok.fg = '#444';
        } else {
            tok.char = this.f.map.get(p.x, p.y);
        }

        this.display.at(p.x, p.y).set(tok, dir);
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

    playerGet(): true {
        const p = this.player;
        let hitLimit = false;
        const got: string[] = [];
        const items = this.f.items.filter((i) => i.pos === p.pos);
        if (!items.length) {
            this.log.info("There's nothing here!");
            return true;
        }

        for (const item of items) {
            if (p.carriedWeight + item.totalWeight > p.maxCarriedWeight) {
                hitLimit = true;
                continue;
            }

            p.get(item);
            this.f.removeItem(item);
            got.push(item.name({ article: true }));
        }

        if (got.length) {
            this.log.coloured(
                colourItems,
                'You pick up %an.',
                niceListJoin(got),
            );
            p.spend(1);
        }
        if (hitLimit)
            this.log.coloured(colourItems, "You can't carry any more.");

        return true;
    }

    playerEquip(): true {
        const p = this.player;
        const choices = p.inventory.filter(
            (i) => i.type === ItemType.Weapon || i.type === ItemType.Armour,
        );

        if (!choices.length) {
            this.log.info('You have no equippable items!');
            return true;
        }

        this.input.getChoice(
            'Which item?',
            choices,
            (i) => i.name(),
            (item) => {
                if (p.equip(item)) p.spend(1);
            },
        );
        return true;
    }

    playerDrop(): true {
        const p = this.player;
        if (!p.inventory.length) {
            this.log.info('You have no items!');
            return true;
        }

        this.input.getChoice(
            'Which item?',
            p.inventory,
            (i) => i.name(),
            (item) => {
                p.inventory = p.inventory.filter((i) => i !== item);
                item.pos = p.pos;
                this.f.items.push(item);
                this.log.coloured(
                    colourItems,
                    'You drop %an.',
                    item.name({ article: true }),
                );
            },
        );
        return true;
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
            end: this.f.map.oob,
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
