import RNG from './RNG';
import { XY } from './types';

export function int(n: number) {
    return Math.floor(n);
}

export function rnd(rng: RNG, max: number) {
    return int(rng.next() * max);
}

export function oneof<T>(rng: RNG, list: T[]) {
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

export function eq(a: XY, b: XY) {
    return a.x === b.x && a.y === b.y;
}

export function mid(n: number) {
    return Math.round(n) + 0.499;
}
