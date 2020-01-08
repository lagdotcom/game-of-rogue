import { Display } from './Display';
import Hooks from './Hooks';
import Architect from './Architect';
import Trace from './Trace';
import { Floor } from './Floor';
import Point from './Point';
import RNG, { tychei } from './RNG';

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
                if (f.player.equals(p)) {
                    this.display.at(x, y).set('white', '#222222', '@');
                } else if (enemy) {
                    this.display.at(x, y).set('red', '#220000', 'E');
                } else if (item) {
                    this.display.at(x, y).set('yellow', '#222200', '$');
                } else {
                    this.display
                        .at(x, y)
                        .set('white', 'black', f.map.get(x, y));
                }
            }
    }
}
