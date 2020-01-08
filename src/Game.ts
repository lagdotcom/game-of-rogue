import { Display } from './Display';
import Hooks from './Hooks';
import Architect from './Architect';
import Trace from './Trace';
import { Floor } from './Floor';
import Point from './Point';
import RNG, { tychei } from './RNG';
import { Tile, Actor, Token, Dir } from './types';
import Player from './Player';
import Input from './Input';

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
    hooks: Hooks;
    input: Input;
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
        this.player = new Player(this);

        this.t.leave('Game.new');
    }

    seed(s?: string) {
        this.rng = new tychei(s);
        this.t.message('rng seed', this.rng.getSeed());
    }

    showAll(f: Floor) {
        this.display.fill(' ');

        for (let y = 0; y < f.map.height; y++)
            for (let x = 0; x < f.map.width; x++) {
                let p = new Point(x, y);
                let enemy = f.enemyAt(p);
                let item = f.itemAt(p);
                let tok: Token;

                if (f.player.equals(p)) {
                    tok = this.player;
                } else if (enemy) {
                    tok = enemy;
                } else if (item) {
                    tok = item;
                } else {
                    let char = f.map.get(x, y);
                    if (!colours[char]) continue;
                    tok = { ...colours[char], char };
                }

                this.display.at(x, y).set(tok.fg, tok.bg, tok.char);
            }
    }

    playerMove(d: Dir) {
        this.t.todo('Game.playerMove', d);
    }
}
