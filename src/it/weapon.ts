import { ItemType, Mods, ItemTraits } from '../types';
import Game from '../Game';
import { rnd } from '../tools';
import { WeaponTemplate } from '../Item';

function w(i: {
    article?: string;
    mods?: Mods;
    name: string;
    rarity?: number;
    traits?: ItemTraits;
    weight?: number;
    hands?: number;
    offhand?: true;
    strength: number;
    movetimer?: number;
    thrown?: true;
    stacked?: true;
    findamt?: (g: Game) => number;
    ammo?: true;
    missile?: true;
    firedBy?: ItemTraits;
}): WeaponTemplate {
    return {
        name: i.name,
        article: i.article || 'a',
        type: ItemType.Weapon,
        mods: i.mods || {},
        weight: i.weight || 0,
        traits: i.traits || {},
        rarity: i.rarity || 1,
        stacked: i.stacked || false,
        findamt: i.findamt,
        hands: i.hands || (i.ammo ? 0 : 1),
        offhand: i.offhand || false,
        strength: i.strength,
        movetimer: i.movetimer || 1,
        thrown: i.thrown || false,
        ammo: i.ammo || false,
        firedBy: i.firedBy,
        missile: i.missile || false,
    };
}

export const katana = w({
    name: 'katana',
    hands: 2,
    strength: 3,
    weight: 5,
    movetimer: 1.1,
    traits: { handle: true, blade: true, sword: true },
});

export const sai = w({
    name: 'sai',
    offhand: true,
    strength: 1,
    weight: 1,
    movetimer: 0.7,
    rarity: 10,
    traits: { handle: true, blade: true, sword: true },
});

export const shuriken = w({
    name: 'shuriken',
    strength: 1,
    movetimer: 0.5,
    thrown: true,
    stacked: true,
    findamt: (g: Game) => rnd(g.rng, 5) + 1,
    traits: { blade: true, missile: true },
});

export const tanto = w({
    name: 'tantō',
    strength: 1,
    weight: 1,
    movetimer: 0.8,
    traits: { handle: true, blade: true, knife: true },
});

export const tekko = w({
    name: 'tekkō',
    article: 'a pair of',
    hands: 2,
    strength: 1,
    weight: 1,
    movetimer: 0.9,
    traits: { handle: true, blade: true, fist: true },
});

export const wakizashi = w({
    name: 'wakizashi',
    strength: 2,
    weight: 3,
    traits: { blade: true, handle: true, sword: true },
});

export const ya = w({
    name: 'ya',
    hands: 0,
    offhand: true,
    strength: 3,
    weight: 0,
    movetimer: 0,
    ammo: true,
    firedBy: { bow: true },
    stacked: true,
    findamt: (g: Game) => rnd(g.rng, 4) + 1,
    traits: { point: true, missile: true, arrow: true },
});

export const yumi = w({
    name: 'yumi',
    hands: 2,
    strength: 0,
    weight: 3,
    movetimer: 1.5,
    missile: true,
    traits: { bow: true, wood: true },
});
