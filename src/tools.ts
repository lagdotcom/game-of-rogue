import { prng } from 'seedrandom';

export function int(n: number) {
    return Math.floor(n);
}

export function rnd(gen: prng, max: number) {
    return Math.floor(gen() * max);
}

export function oneof<T>(gen: prng, list: T[]) {
    return list.length ? list[rnd(gen, list.length)] : null;
}

export function includes<T>(list: T[], value: T) {
    return list.indexOf(value) >= 0;
}

export function any<T>(list: T[], fn: (item: T) => boolean) {
    for (let i = 0; i < list.length; i++) if (fn(list[i])) return true;

    return false;
}
