import { Display } from './Display';
import Hooks from './Hooks';
import Architect from './Architect';
import Trace from './Trace';
import { Floor } from './Floor';
import Point from './Point';
import RNG, { tychei } from './RNG';
import { Tile } from './types';

interface TileColour {
    fg: string;
    bg: string;
}

const colours: { [index: string]: TileColour } = {
    [Tile.Player]: { fg: 'white', bg: '#202020' },
    [Tile.Door]: { fg: 'brown', bg: 'black' },
    [Tile.Space]: { fg: '#404040', bg: 'black' },
    [Tile.Wall]: { fg: '#808080', bg: 'black' },
    [Tile.Enemy]: { fg: 'red', bg: '#200000' },
    [Tile.Treasure]: { fg: 'yellow', bg: '#202000' },
};

export default class Game {
    architect: Architect;
    display: Display;
    hooks: Hooks;
    rng: RNG;
    t: Trace;

    constructor(parent: HTMLElement) {
        this.t = new Trace();
        this.t.enter('Game.new');
        this.seed();

        this.display = new Display(parent, 80, 40);
        this.display.str(0, 0, 'setting up...');

        this.architect = new Architect(this);
        this.hooks = new Hooks(this);

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
                let t: string;
                if (f.player.equals(p)) {
                    t = '@';
                } else if (enemy) {
                    t = Tile.Enemy;
                } else if (item) {
                    t = Tile.Treasure;
                } else {
                    t = f.map.get(x, y);
                }

                if (colours[t])
                    this.display.at(x, y).set(colours[t].fg, colours[t].bg, t);
            }
    }
}
