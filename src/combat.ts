import { Actor } from './types';

export function attack(a: Actor, v: Actor) {
    a.g.t.todo('attack', a, v);
}
