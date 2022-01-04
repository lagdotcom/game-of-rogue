import Game from '../Game';
import { WeaponTemplate } from '../Item';
import { RequireSome, rnd } from '../tools';
import { ItemType } from '../types';

function w({
    article = 'a',
    type = ItemType.Weapon,
    rarity = 1,
    traits = {},
    weight = 0,
    offhand = false,
    moveTimer = 1,
    thrown = false,
    stacked = false,
    ammo = false,
    hands = ammo ? 0 : 1,
    missile = false,
    ...etc
}: RequireSome<WeaponTemplate, 'name'>): WeaponTemplate {
    return {
        article,
        type,
        weight,
        traits,
        rarity,
        stacked,
        hands,
        offhand,
        moveTimer,
        thrown,
        ammo,
        missile,
        ...etc,
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
    char: '*',
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
