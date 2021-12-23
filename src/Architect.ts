import {
  dirOffsets,
  ROOMGEN_ATTEMPTS,
  ROOMGEN_MINENEMIES,
  ROOMGEN_MINROOMS,
} from './constants';
import { EnemyNinja } from './en/EnemyNinja';
import { EnemySamurai } from './en/EnemySamurai';
import { Floor } from './Floor';
import Game from './Game';
import { Grid } from './Grid';
import { randomItem } from './Item';
import { rooms } from './rooms';
import { any, int, oneOf, rnd } from './tools';
import { Tile, XY } from './types';

const debugCleanup = true;
const debugFits = false;

const surrounds = Object.values(dirOffsets);

export default class Architect {
    g: Game;

    constructor(g: Game) {
        this.g = g;
    }

    generate(
        floor: number,
        width: number,
        height: number,
        maxParts: number,
        recurse: boolean = false,
    ): Floor {
        if (!recurse) {
            this.g.t.enter(
                'Architect.generate',
                width,
                height,
                maxParts,
                this.g.rng.getSeed(),
            );
            this.g.hooks.fire('architect.begin', {});
        }

        const f = new Floor(`Floor${floor}`, width, height);
        const centre = this.randomRoom();
        const cx = int((width - centre.width) / 2);
        const cy = int((height - centre.height) / 2);
        this.g.t.message(`pasted ${centre.name} @${cx},${cy}`);
        f.map.paste(cx, cy, centre, ' ');

        let attempts = 0;
        let parts = 1;
        const taken = new Set<XY>();
        while (parts < maxParts) {
            const room = this.randomRoom();
            const pos = this.pickPastePoint(f.map, room, '#', 'd');

            if (pos && this.fits(f.map, room, pos) && !taken.has(pos)) {
                this.g.t.message(`pasted ${room.name} @${pos.x},${pos.y}`);
                f.map.paste(pos.x, pos.y, room, ' ');
                parts++;
                taken.add(pos);
            } else {
                attempts++;
                if (attempts > ROOMGEN_ATTEMPTS) {
                    this.g.t.message('exceeded attempts threshold');
                    break;
                }
            }
        }

        if (parts < ROOMGEN_MINROOMS) {
            this.g.t.message("didn't generate enough rooms, retrying");
            return this.generate(floor, width, height, maxParts, true);
        }

        this.cleanup(f.map);
        this.addEnemies(f);
        this.addTreasure(f);
        this.placePlayer(f);

        this.g.hooks.fire('architect.end', { floor: f });
        this.g.t.leave('Architect.generate');
        return f;
    }

    randomRoom() {
        const room = oneOf(this.g.rng, rooms);
        return room.rotate(rnd(this.g.rng, 4));
    }

    pickPastePoint(g: Grid, r: Grid, ...t: string[]): XY {
        const w = oneOf(this.g.rng, g.find(...t));
        if (!w) return null;

        return {
            x: rnd(this.g.rng, 2) ? w.x : w.x - r.width + 1,
            y: rnd(this.g.rng, 2) ? w.y : w.y - r.height + 1,
        };
    }

    fits(m: Grid, r: Grid, p: XY) {
        if (p.x < 0) return false;
        if (p.y < 0) return false;
        if (p.x + r.width >= m.width) return false;
        if (p.y + r.height >= m.height) return false;

        if (debugFits) this.g.t.enter('fits', r.name, p);
        let newDoor = false;
        for (let cx = p.x; cx < p.x + r.width; cx++) {
            for (let cy = p.y; cy < p.y + r.height; cy++) {
                const dt = m.get(cx, cy);
                const st = r.get(cx - p.x, cy - p.y);

                if (st == Tile.Empty || dt == Tile.Empty) continue;

                if (
                    dt != Tile.Wall &&
                    dt != Tile.NotDoor &&
                    dt != Tile.Empty &&
                    dt != st
                ) {
                    if (debugFits) {
                        this.g.t.message('conflict', cx, cy, dt, st);
                        this.g.t.leave('fits');
                    }
                    return false;
                }

                if (dt == Tile.NotDoor && st == Tile.Door) {
                    if (debugFits) {
                        this.g.t.message('notDoor', cx, cy, dt, st);
                        this.g.t.leave('fits');
                    }
                    return false;
                }

                if ((dt == Tile.Wall || dt == Tile.Door) && st == Tile.Door)
                    newDoor = true;
            }
        }

        if (debugFits) {
            this.g.t.message('door found?', newDoor);
            this.g.t.leave('fits');
        }
        return newDoor;
    }

    cleanup(m: Grid) {
        if (debugCleanup) this.g.t.enter('Architect.cleanup');
        let cleanup = true;
        while (cleanup) {
            cleanup = false;

            for (let y = 0; y < m.height; y++) {
                for (let x = 0; x < m.width; x++) {
                    const tc = m.get(x, y);

                    if (tc == Tile.NotDoor) {
                        m.set(x, y, Tile.Wall);
                        continue;
                    }

                    if (tc != Tile.Door) continue;

                    const tu = m.get(x, y - 1);
                    const tl = m.get(x - 1, y);
                    const tr = m.get(x + 1, y);
                    const td = m.get(x, y + 1);

                    // don't allow doors on the border
                    if (
                        x == 0 ||
                        x == m.width - 1 ||
                        y == 0 ||
                        y == m.height - 1
                    ) {
                        m.set(x, y, Tile.Wall);
                        continue;
                    }

                    // door to wall? carve it out
                    if (tl == Tile.Space && tr == Tile.Wall) {
                        if (debugCleanup) this.g.t.message('carve right', x, y);
                        cleanup = true;
                        m.set(x + 1, y, Tile.Space);
                        continue;
                    }
                    if (tr == Tile.Space && tl == Tile.Wall) {
                        if (debugCleanup) this.g.t.message('carve left', x, y);
                        cleanup = true;
                        m.set(x - 1, y, Tile.Space);
                        continue;
                    }
                    if (tu == Tile.Space && td == Tile.Wall) {
                        if (debugCleanup) this.g.t.message('carve down', x, y);
                        cleanup = true;
                        m.set(x, y + 1, Tile.Space);
                        continue;
                    }
                    if (td == Tile.Space && tu == Tile.Wall) {
                        if (debugCleanup) this.g.t.message('carve up', x, y);
                        cleanup = true;
                        m.set(x, y - 1, Tile.Space);
                        continue;
                    }

                    // wrong walls?
                    if (
                        (tl == Tile.Wall && tr != Tile.Wall) ||
                        (tr == Tile.Wall && tl != Tile.Wall) ||
                        (tu == Tile.Wall && td != Tile.Wall) ||
                        (td == Tile.Wall && tu != Tile.Wall)
                    ) {
                        cleanup = true;
                        m.set(x, y, Tile.Space);
                        continue;
                    }

                    // too many spaces
                    let spaces = 0;
                    if (tl == Tile.Space) spaces++;
                    if (tr == Tile.Space) spaces++;
                    if (tu == Tile.Space) spaces++;
                    if (td == Tile.Space) spaces++;
                    if (spaces > 2) {
                        if (debugCleanup)
                            this.g.t.message('too many spaces', x, y);
                        cleanup = true;
                        m.set(x, y, Tile.Space);
                        continue;
                    }

                    // too many doors
                    if (
                        (tl == Tile.Space && tr == Tile.Door) ||
                        (tr == Tile.Space && tl == Tile.Door) ||
                        (tu == Tile.Space && td == Tile.Door) ||
                        (td == Tile.Space && tu == Tile.Door)
                    ) {
                        if (debugCleanup)
                            this.g.t.message('too many doors', x, y);
                        cleanup = true;
                        m.set(x, y, Tile.Space);
                        continue;
                    }

                    // door to nowhere
                    if (
                        (tl == Tile.Empty && tr == Tile.Space) ||
                        (tr == Tile.Empty && tl == Tile.Space) ||
                        (tu == Tile.Empty && td == Tile.Space) ||
                        (td == Tile.Empty && tu == Tile.Space)
                    ) {
                        if (debugCleanup)
                            this.g.t.message('door to nowhere', x, y);
                        cleanup = true;
                        m.set(x, y, Tile.Wall);
                        continue;
                    }
                }
            }
        }

        m.find(Tile.Space, Tile.Door).forEach((p) => {
            if (
                any(
                    surrounds,
                    (s) => m.get(p.x + s.x, p.y + s.y) === Tile.Empty,
                )
            ) {
                if (debugCleanup)
                    this.g.t.message('leak plugged', m.get(p.x, p.y), p);
                m.set(p.x, p.y, Tile.Wall);
            }
        });

        //m.replace(Tile.Empty, Tile.Wall);
        if (debugCleanup) this.g.t.leave('Architect.cleanup');
    }

    addEnemies(f: Floor) {
        this.g.t.enter('Architect.addEnemies');

        f.map.find(Tile.Enemy).forEach((p) => {
            const enemy = randomEnemy(this.g);
            f.map.set(p.x, p.y, Tile.Space);

            enemy.pos = p;
            f.enemies.push(enemy);
        });

        while (f.enemies.length < ROOMGEN_MINENEMIES) {
            const enemy = randomEnemy(this.g);
            const p = oneOf(this.g.rng, f.map.find(Tile.Space));

            if (!f.enemyAt(p)) {
                enemy.pos = p;
                f.enemies.push(enemy);
            }
        }

        this.g.t.leave('Architect.addEnemies');
    }

    addTreasure(f: Floor) {
        this.g.t.enter('Architect.addTreasure');

        f.map.find(Tile.Treasure).forEach((p) => {
            const item = randomItem(this.g);
            f.map.set(p.x, p.y, Tile.Space);

            item.pos = p;
            f.items.push(item);
        });

        this.g.t.leave('Architect.addTreasure');
    }

    placePlayer(f: Floor) {
        this.g.t.enter('Architect.placePlayer');

        while (true) {
            const p = oneOf(this.g.rng, f.map.find(Tile.Space));

            if (f.enemyAt(p) || f.itemAt(p)) continue;
            f.player = p;
            break;
        }

        this.g.t.leave('Architect.placePlayer');
    }
}

const enemies = [EnemyNinja, EnemySamurai];

export function randomEnemy(g: Game) {
    const enemyClass = oneOf(g.rng, enemies);
    g.t.enter('randomEnemy', enemyClass.name);

    const e = new enemyClass(g);
    g.t.leave('randomEnemy');
    return e;
}
