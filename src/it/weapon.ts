import Game from '../Game';
import { WeaponTemplate } from '../Item';
import { rnd } from '../tools';
import { ItemTraits, ItemType } from '../types';

function w({
    article = 'a',
    name,
    rarity = 1,
    traits = {},
    weight = 0,
    hands,
    offhand = false,
    power,
    moveTimer = 1,
    thrown = false,
    stacked = false,
    getStackAmount,
    ammo = false,
    missile = false,
    firedBy,
}: {
    article?: string;
    name: string;
    rarity?: number;
    traits?: ItemTraits;
    weight?: number;
    hands?: number;
    offhand?: boolean;
    power: number;
    moveTimer?: number;
    thrown?: boolean;
    stacked?: boolean;
    getStackAmount?: (g: Game) => number;
    ammo?: boolean;
    missile?: boolean;
    firedBy?: ItemTraits;
}): WeaponTemplate {
    return {
        name,
        article,
        type: ItemType.Weapon,
        weight,
        traits,
        rarity,
        stacked,
        getStackAmount: getStackAmount,
        hands: hands || (ammo ? 0 : 1),
        offhand,
        power,
        moveTimer,
        thrown,
        ammo,
        firedBy,
        missile,
    };
}

export const katana = w({
    name: 'katana',
    hands: 2,
    power: 3,
    weight: 5,
    moveTimer: 1.1,
    traits: { handle: true, blade: true, sword: true },
});

export const sai = w({
    name: 'sai',
    offhand: true,
    power: 1,
    weight: 1,
    moveTimer: 0.7,
    rarity: 10,
    traits: { handle: true, blade: true, sword: true },
});

export const shuriken = w({
    name: 'shuriken',
    power: 1,
    moveTimer: 0.5,
    offhand: true,
    thrown: true,
    stacked: true,
    getStackAmount: (g: Game) => rnd(g.rng, 5) + 1,
    traits: { blade: true, missile: true },
});

export const tanto = w({
    name: 'tantō',
    power: 1,
    weight: 1,
    moveTimer: 0.8,
    traits: { handle: true, blade: true, knife: true },
});

export const tekko = w({
    name: 'tekkō',
    article: 'a pair of',
    hands: 2,
    power: 1,
    weight: 1,
    moveTimer: 0.9,
    traits: { handle: true, blade: true, fist: true },
});

export const wakizashi = w({
    name: 'wakizashi',
    power: 2,
    weight: 3,
    traits: { blade: true, handle: true, sword: true },
});

export const ya = w({
    name: 'ya',
    hands: 0,
    offhand: true,
    power: 3,
    weight: 0,
    moveTimer: 0,
    ammo: true,
    firedBy: { bow: true },
    stacked: true,
    getStackAmount: (g: Game) => rnd(g.rng, 4) + 1,
    traits: { point: true, missile: true, arrow: true },
});

export const yumi = w({
    name: 'yumi',
    hands: 2,
    power: 0,
    weight: 3,
    moveTimer: 1.5,
    missile: true,
    traits: { bow: true, wood: true },
});

export const humanFist = w({
    name: 'fist',
    article: 'your',
    hands: 2,
    power: 0,
});
