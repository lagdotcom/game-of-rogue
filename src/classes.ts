import { Class } from './types';
import { Kick } from './sk/Kick';
import { Sweep } from './sk/Sweep';
import { Clone } from './sk/Clone';
import { Substitute } from './sk/Substitute';

export const Samurai: Class = {
    name: 'Samurai',
    hp: 12,
    hpGain: 4,
    ki: 8,
    kiGain: 3,
    str: 10,
    strGain: 1,
    skills: [Sweep],
};

export const Ninja: Class = {
    name: 'Ninja',
    hp: 6,
    hpGain: 2,
    ki: 10,
    kiGain: 4,
    str: 4,
    strGain: 0,
    skills: [Clone, Substitute],
};

export const Monk: Class = {
    name: 'Monk',
    hp: 10,
    hpGain: 3,
    ki: 12,
    kiGain: 4,
    str: 8,
    strGain: 0.5,
    skills: [Kick],
};

export const Mystic: Class = {
    name: 'Mystic',
    hp: 4,
    hpGain: 1,
    ki: 14,
    kiGain: 6,
    str: 2,
    strGain: 0,
    skills: [],
};
