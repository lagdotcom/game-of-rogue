import { Actor } from './Actor';
import RNG from './RNG';
import { Dir } from './types';

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

export function getDirectionBetween(a: Actor, b: Actor) {
    const dx = a.pos.x - b.pos.x;
    const dy = a.pos.y - b.pos.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (dx < 0 && ax >= ay) return Dir.W;
    if (dx > 0 && ax >= ay) return Dir.E;
    if (dy < 0) return Dir.N;
    return Dir.S;
}

export function getAngleBetween(a: Dir, b: Dir) {
    if (a === b) return 0;

    if (a === Dir.N && b === Dir.S) return 2;
    if (a === Dir.E && b === Dir.W) return 2;
    if (a === Dir.S && b === Dir.N) return 2;
    if (a === Dir.W && b === Dir.E) return 2;
    return 1;
}
