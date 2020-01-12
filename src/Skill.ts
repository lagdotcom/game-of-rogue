import { Actor } from './Actor';

export interface Skill {
    name: string;
    balance: number;
    ki: number;
    movetimer: number;
    fn: (a: Actor) => boolean;
}
