import { Class } from './Class';
import Game from './Game';
import { doMaru, hachimaki } from './it/armor';
import { shuriken, tanto, wakizashi, ya, yumi } from './it/weapon';
import { constructItem } from './Item';
import Player from './Player';
import { Clone } from './sk/Clone';
import { Kick } from './sk/Kick';
import { expireSubstitute, Substitute } from './sk/Substitute';
import { Sweep } from './sk/Sweep';

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
        p.equip(constructItem(p.g, doMaru));
        p.get(constructItem(p.g, yumi));
        p.get(constructItem(p.g, ya));

        // TODO
        p.skills.push(Sweep.name);
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

        // TODO
        p.skills.push(Clone.name);
        p.skills.push(Substitute.name);
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

        // TODO
        p.skills.push(Kick.name);
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

export function initClasses(g: Game) {
    g.hooks.on('sys.advance', () => expireSubstitute(g));
}
