import { Actor } from './Actor';

export function attack(a: Actor, v: Actor) {
    a.g.t.todo('attack', a, v);
}
