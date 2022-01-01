import seedrandom from 'seedrandom';

export default interface RNG {
    name: string;
    next(): number;
    getSeed(): string;
    setSeed(seed: string): void;
}

type prng = ReturnType<typeof seedrandom.tychei>;
type prng_maker = (seed?: string, options?: seedrandom.Options) => prng;

abstract class AbstractRNG {
    gen: prng_maker;
    impl!: prng;

    constructor(gen: prng_maker, seed?: string) {
        this.gen = gen;
        this.setSeed(seed);
    }

    next() {
        return this.impl();
    }

    setSeed(seed?: string) {
        const state = seed ? this.parseSeed(seed) : this.randomState();
        this.impl = this.gen(undefined, { state });
    }

    abstract getSeed(): string;
    abstract parseSeed(seed: string): object;
    abstract randomState(): object;
}

interface TycheiState {
    a: number;
    b: number;
    c: number;
    d: number;
}
export class tychei extends AbstractRNG implements RNG {
    name: 'tychei';

    constructor(seed?: string) {
        super(seedrandom.tychei, seed);
        this.name = 'tychei';
    }

    getSeed() {
        const s = <TycheiState>this.impl.state();
        return [s.a, s.b, s.c, s.d].map(encode).join('.');
    }

    parseSeed(seed: string): TycheiState {
        const parts = seed.split('.');
        return {
            a: decode(parts[0]),
            b: decode(parts[1]),
            c: decode(parts[2]),
            d: decode(parts[3]),
        };
    }

    randomState() {
        const temp = this.gen(Math.random().toString(), { state: true });
        return temp.state();
    }
}

function encode(n: number) {
    return (n >>> 0).toString(36);
}

function decode(s: string) {
    return ~~parseInt(s, 36);
}
