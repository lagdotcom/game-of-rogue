import { Actor } from './Actor';
import { colourItems } from './colours';
import { ARTIFACT_CHANCE, MAGIC_CHANCE } from './constants';
import Enchantment, { EnchantmentSlot } from './Enchantment';
import { randomEnchant } from './enchantments';
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
import { entries, isDefined, niceListJoin, oneOf, rnd } from './tools';
import {
    ItemSlot,
    ItemTraits,
    ItemType,
    ModKey,
    Mods,
    Token,
    XY,
} from './types';

export default class Item<T extends ItemTemplate = ItemTemplate> {
    count?: number;
    enchantments: Enchantment[];
    pos?: XY;
    template: T;
    token: Token;
    type: ItemType;

    constructor(public g: Game, t: T) {
        this.enchantments = [];
        this.token = {
            bg: t.bg || '#202000',
            char: t.char || itemChars[t.type] || '$',
            fg: t.fg || 'yellow',
        };
        this.template = t;
        this.type = t.type;

        if (t.getStackAmount) this.count = t.getStackAmount(g);
    }

    get armour() {
        return this.stat('armour');
    }
    get moveTimer() {
        return this.stat('moveTimer');
    }
    get power() {
        return this.stat('power');
    }
    get sightFov() {
        return this.stat('sightFov');
    }
    get strength() {
        return this.stat('strength');
    }
    get weight() {
        return this.stat('weight');
    }

    get totalWeight() {
        return this.weight * (this.count || 1);
    }

    matches(tr: ItemTraits) {
        let result = true;
        entries(tr).forEach((p) => {
            if (this.template?.traits[p[0]] !== p[1]) result = false;
        });

        return result;
    }

    get fullName() {
        let prefix = '';
        let suffix = '';
        this.enchantments.forEach((e) => {
            if (e.slot === EnchantmentSlot.Prefix) prefix = e.name + ' ';
            else if (e.slot === EnchantmentSlot.Suffix) suffix = ' ' + e.name;
        });

        return `${prefix}${this.template.name}${suffix}`;
    }

    name(flags: { article?: boolean; singular?: boolean } = {}) {
        if (this.template.stacked && !flags.singular)
            return `${this.count} ${this.fullName}`;

        if (flags.article) return `${this.template.article} ${this.fullName}`;

        return this.fullName;
    }

    stat(k: ModKey) {
        let base = this.template[k] ?? 0;

        const allMods = [
            this.template.mods?.get(k),
            ...this.enchantments.map((e) => e.mods?.get(k)),
        ].filter(isDefined);
        for (const mod of allMods) {
            if (typeof mod === 'function') base = mod(base);
            else base += mod;
        }

        return base;
    }
}

export function isArmour(i: Item): i is Item<ArmourTemplate> {
    return i.type === ItemType.Armour;
}
export function isOther(i: Item): i is Item<OtherTemplate> {
    return i.type === ItemType.Other;
}
export function isWeapon(i: Item): i is Item<WeaponTemplate> {
    return i.type === ItemType.Weapon;
}

interface BaseTemplate {
    name: string;
    char?: string;
    fg?: string;
    bg?: string;
    article: string;
    type: ItemType;
    rarity: number;
    stacked: boolean;
    getStackAmount?: (g: Game) => number;
    traits: ItemTraits;
    armour?: number;
    balanceMax?: number;
    balanceRegen?: number;
    hearingRange?: number;
    hpMax?: number;
    hpRegen?: number;
    kiMax?: number;
    kiRegen?: number;
    moveCost?: number;
    moveTimer?: number;
    power?: number;
    sightFov?: number;
    sightRange?: number;
    strength?: number;
    weight?: number;
    mods?: Mods;
    listeners?: {
        [T in GameEventName]?: GameEventHandler<T>;
    };
}

export interface ArmourTemplate extends BaseTemplate {
    type: ItemType.Armour;
    slot: ItemSlot;
}

export interface OtherTemplate extends BaseTemplate {
    type: ItemType.Other;
}

export interface WeaponTemplate extends BaseTemplate {
    type: ItemType.Weapon;
    hands: number;
    offhand: boolean;
    missile: boolean;
    thrown: boolean;
    ammo: boolean;
    firedBy?: ItemTraits;
}

export type ItemTemplate = ArmourTemplate | OtherTemplate | WeaponTemplate;

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

export function constructItem(g: Game, template: ItemTemplate, enchant = true) {
    g.t.enter('constructItem', template.name, enchant);
    const item = new Item(g, template);

    if (
        enchant &&
        !template.traits.legendary &&
        rnd(g.rng, 100) < MAGIC_CHANCE
    ) {
        randomEnchant(g, item);
        if (rnd(g.rng, 100) < MAGIC_CHANCE) randomEnchant(g, item);
    }

    g.t.leave('constructItem');
    return item;
}

export function randomItem(g: Game, enchant = true) {
    const template = randomItemTemplate(g);
    return constructItem(g, template, enchant);
}

export type Equipment = {
    [ItemSlot.Body]?: Item<ArmourTemplate>;
    [ItemSlot.BothHands]?: Item<WeaponTemplate>;
    [ItemSlot.Head]?: Item<ArmourTemplate>;
    [ItemSlot.Primary]?: Item<WeaponTemplate>;
    [ItemSlot.Secondary]?: Item<WeaponTemplate>;
};

export function dropItems(g: Game, v: Actor) {
    const drops: string[] = [];
    const items = v.inventory.concat(
        Object.values(v.equipment).filter(isDefined),
    );
    items.forEach((i) => {
        drops.push(i.name({ article: true }));
        i.pos = v.pos;
        g.f.items.push(i);
    });

    g.log.coloured(colourItems, '%an drop%as %bn.', v, niceListJoin(drops));
}

export function initItems(g: Game) {
    g.hooks.on('player.move', ({ actor }) => {
        const items = g.f.items.filter((i) => i.pos === actor.pos);
        if (items.length)
            g.log.info(
                'You see here %an.',
                niceListJoin(items.map((i) => i.name({ article: true }))),
            );
    });
}
