import { Class } from './types';
import { Kick } from './sk/Kick';
import { Sweep } from './sk/Sweep';
import { Clone } from './sk/Clone';
import { Substitute } from './sk/Substitute';

export const Samurai: Class = {
    name: 'Samurai',
    hp: 12,
    hpg: 4,
    ki: 8,
    kig: 3,
    str: 10,
    strg: 1,
    skills: [Sweep],
};

export const Ninja: Class = {
    name: 'Ninja',
    hp: 6,
    hpg: 2,
    ki: 10,
    kig: 4,
    str: 4,
    strg: 0,
    skills: [Clone, Substitute],
};

export const Monk: Class = {
    name: 'Monk',
    hp: 10,
    hpg: 3,
    ki: 12,
    kig: 4,
    str: 8,
    strg: 0.5,
    skills: [Kick],
};

export const Mystic: Class = {
    name: 'Mystic',
    hp: 4,
    hpg: 1,
    ki: 14,
    kig: 6,
    str: 2,
    strg: 0,
    skills: [],
};
