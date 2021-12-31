import { ARTIFACT_CHANCE, MAGIC_CHANCE } from './constants';
import Game from './Game';
import { GameEventHandler, GameEventName } from './Hooks';
import { doMaru, hachimaki, sujiBachi } from './it/armor';
import { kusanagi } from './it/artifact';
import {
    katana,
    sai,
    shuriken,
    tanto,
    tekko,
    wakizashi,
    ya,
    yumi,
} from './it/weapon';
import { oneOf, rnd } from './tools';
import { ItemSlot, ItemTraits, ItemType, Mods, Token, XY } from './types';

export default abstract class Item {
    count?: number;
    mods: Mods;
    pos: XY;
    template: ItemTemplate;
    token: Token;
    type: ItemType;

    constructor(public g: Game, t?: ItemTemplate) {
        this.token = { bg: '#202000', char: '$', fg: 'yellow' };
        this.type = ItemType.Other;

        if (t) {
            this.mods = Object.assign({}, t.mods);
            this.template = t;
            this.token.char = itemChars[t.type];
            this.type = t.type;

            if (t.getStackAmount) this.count = t.getStackAmount(g);
        }
    }

    matches(tr: ItemTraits) {
        let result = true;
        Object.values(tr).forEach((p: [string, boolean]) => {
            if (this.template.traits[p[0]] !== p[1]) result = false;
        });

        return result;
    }

    name(flags: { article?: boolean; singular?: boolean } = {}) {
        if (this.template.stacked && !flags.singular)
            return `${this.count} ${this.template.name}`;

        if (flags.article)
            return `${this.template.article} ${this.template.name}`;

        return this.template.name;
    }
}

export interface ItemTemplate {
    name: string;
    article: string;
    type: ItemType;
    slot?: ItemSlot;
    weight?: number;
    rarity: number;
    stacked: boolean;
    getStackAmount?: (g: Game) => number;
    traits: ItemTraits;
    mods: Mods;
    listeners?: {
        [T in GameEventName]?: GameEventHandler<T>;
    };
}

export interface ArmourTemplate extends ItemTemplate {
    type: ItemType.Armour;
}

export interface WeaponTemplate extends ItemTemplate {
    type: ItemType.Weapon;
    hands: number;
    offhand: boolean;
    moveTimer: number;
    strength: number;
    thrown: boolean;
    ammo: boolean;
    missile: boolean;
    firedBy?: ItemTraits;
}

export class Armour extends Item {
    template: ArmourTemplate;
    type: ItemType.Armour;
}

export class OtherItem extends Item {
    type: ItemType.Other;
}

export class Weapon extends Item {
    template: WeaponTemplate;
    type: ItemType.Weapon;

    constructor(g: Game, template: WeaponTemplate) {
        super(g, template);

        if (template.ammo) this.token.char = '/';
    }
}

const artifacts = [kusanagi];
const items = [
    katana,
    sai,
    shuriken,
    tanto,
    tekko,
    wakizashi,
    ya,
    yumi,
    doMaru,
    hachimaki,
    sujiBachi,
];

const itemChars = {
    [ItemType.Armour]: '[',
    [ItemType.Weapon]: ')',
    [ItemType.Other]: '$',
};

function randomItemTemplate(g: Game) {
    while (true) {
        if (rnd(g.rng, 100) < ARTIFACT_CHANCE) return oneOf(g.rng, artifacts);

        const item = oneOf(g.rng, items);
        if (rnd(g.rng, 100) >= item.rarity) return item;
    }
}

function randomEnchant(g: Game, i: Item) {
    g.t.todo('randomEnchant', i.template.name);
}

export function instantiateItem(g: Game, template: ItemTemplate) {
    switch (template.type) {
        case ItemType.Armour:
            return new Armour(g, <ArmourTemplate>template);
        case ItemType.Weapon:
            return new Weapon(g, <WeaponTemplate>template);
        default:
            return new OtherItem(g, template);
    }
}

export function constructItem(g: Game, template: ItemTemplate) {
    g.t.enter('constructItem', template.name);
    const item = instantiateItem(g, template);

    if (!template.traits.legendary && rnd(g.rng, 100) < MAGIC_CHANCE) {
        randomEnchant(g, item);
        if (rnd(g.rng, 100) < MAGIC_CHANCE) randomEnchant(g, item);
    }

    g.t.leave('constructItem');
    return item;
}

export function randomItem(g: Game) {
    const template = randomItemTemplate(g);
    return constructItem(g, template);
}

export type Equipment = {
    [ItemSlot.Body]?: Armour;
    [ItemSlot.BothHands]?: Weapon;
    [ItemSlot.Head]?: Armour;
    [ItemSlot.Primary]?: Weapon;
    [ItemSlot.Secondary]?: Weapon;
};
