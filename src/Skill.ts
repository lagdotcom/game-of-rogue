import { Actor } from './Actor';

export interface Skill {
    name: string;
    balance: number;
    ki: number;
    moveTimer: number;
    fn: (a: Actor) => boolean;
}
