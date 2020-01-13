import { Class } from './Class';
import { Kick } from './sk/Kick';
import { Sweep } from './sk/Sweep';
import { Clone } from './sk/Clone';
import { Substitute } from './sk/Substitute';
import Player from './Player';
import { constructItem } from './Item';
import { wakizashi, yumi, ya, tanto, shuriken } from './it/weapon';
import { domaru, hachimaki } from './it/armor';

export const Samurai: Class = {
    name: 'Samurai',
    hp: 12,
    hpGain: 4,
    ki: 8,
    kiGain: 3,
    str: 10,
    strGain: 1,
    skills: [Sweep],
    init: (p: Player) => {
        p.equip(constructItem(p.g, wakizashi));
        p.equip(constructItem(p.g, domaru));
        p.get(constructItem(p.g, yumi));
        p.get(constructItem(p.g, ya));
    },
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
    init: (p: Player) => {
        p.equip(constructItem(p.g, tanto));
        p.equip(constructItem(p.g, shuriken));
    },
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
    init: (p: Player) => {
        p.equip(constructItem(p.g, hachimaki));
    },
};

export const Taoist: Class = {
    name: 'Taoist',
    hp: 4,
    hpGain: 1,
    ki: 14,
    kiGain: 6,
    str: 2,
    strGain: 0,
    skills: [],
    init: (p: Player) => {
        p.g.t.todo('Taoist.init');
    },
};
