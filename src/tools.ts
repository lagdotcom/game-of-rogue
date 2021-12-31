import Game from './Game';
import RNG from './RNG';
import { Dir, Tile, XY } from './types';

export function int(n: number) {
    return Math.floor(n);
}

export function rnd(rng: RNG, max: number) {
    return int(rng.next() * max);
}

export function oneOf<T>(rng: RNG, list: T[]) {
    return list.length ? list[rnd(rng, list.length)] : null;
}

export function any<T>(list: T[], fn: (item: T) => boolean) {
    for (let i = 0; i < list.length; i++) if (fn(list[i])) return true;

    return false;
}

const pi2 = Math.PI * 2;
export function deg2rad(a: number): number {
    return (pi2 * a) / 360;
}

export function mid(n: number) {
    return Math.round(n) + 0.499;
}

export function capFirst(s: string) {
    return s.slice(0, 1).toUpperCase() + s.slice(1);
}

export function bonusText(n: number) {
    return n < 0 ? `${n}` : `+${n}`;
}

export function getCardinalDirectionBetween(a: XY, b: XY) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (dx < 0 && ax >= ay) return Dir.W;
    if (dx > 0 && ax >= ay) return Dir.E;
    if (dy < 0) return Dir.N;
    return Dir.S;
}

const octant = Math.PI / 4;
export function getDirectionBetween(a: XY, b: XY) {
    const dy = b.y - a.y;
    const dx = b.x - a.x;
    const theta = Math.atan2(dy, dx) + octant / 2;
    const q = Math.floor(theta / octant) + 3;

    return [Dir.NW, Dir.N, Dir.NE, Dir.E, Dir.SE, Dir.S, Dir.SW, Dir.W][q];
}

export function getCardinalAngleBetween(a: Dir, b: Dir) {
    if (a === b) return 0;

    if (a === Dir.N && b === Dir.S) return 2;
    if (a === Dir.E && b === Dir.W) return 2;
    if (a === Dir.S && b === Dir.N) return 2;
    if (a === Dir.W && b === Dir.E) return 2;
    return 1;
}

export function getDistanceBetween(a: XY, b: XY) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function findSpace(g: Game, pos: XY, dist: number) {
    for (let attempts = 0; attempts < 1000; attempts++) {
        const ox = rnd(g.rng, dist * 2) - dist;
        const oy = rnd(g.rng, dist * 2) - dist;
        const dest = g.f.map.ref(pos.x + ox, pos.y + oy);

        if (!isBlocked(g, dest)) return dest;
    }
}

export function isBlocked(g: Game, pos: XY) {
    const tile = g.f.map.get(pos.x, pos.y);
    const blockers = g.blockers(pos);

    return blockers.length > 0 || tile !== Tile.Space;
}
