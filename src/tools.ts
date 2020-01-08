import RNG from './RNG';
import { Dir } from './types';
import Point from './Point';

export function int(n: number) {
    return Math.floor(n);
}

export function rnd(rng: RNG, max: number) {
    return Math.floor(rng.next() * max);
}

export function oneof<T>(rng: RNG, list: T[]) {
    return list.length ? list[rnd(rng, list.length)] : null;
}

export function any<T>(list: T[], fn: (item: T) => boolean) {
    for (let i = 0; i < list.length; i++) if (fn(list[i])) return true;

    return false;
}

export const directions: { [dir: number]: { x: number; y: number } } = {
    [Dir.North]: { x: 0, y: -1 },
    [Dir.NorthEast]: { x: 1, y: -1 },
    [Dir.East]: { x: 1, y: 0 },
    [Dir.SouthEast]: { x: 1, y: 1 },
    [Dir.South]: { x: 0, y: 1 },
    [Dir.SouthWest]: { x: -1, y: 1 },
    [Dir.West]: { x: -1, y: 0 },
    [Dir.NorthWest]: { x: -1, y: -1 },
};
