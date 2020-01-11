import { Token, XY, ItemType, ItemTemplate } from './types';
import Game from './Game';
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
import { domaru, hachimaki, sujibachi } from './it/armor';
import { rnd, oneof } from './tools';
import { ARTIFACT_CHANCE, MAGIC_CHANCE } from './consts';

export default class Item implements Token {
    isItem: true;
    bg: string;
    char: string;
    count?: number;
    fg: string;
    g: Game;
    pos: XY;

    constructor(g: Game, t?: ItemTemplate) {
        // TODO
        this.isItem = true;
        this.bg = '#202000';
        this.char = '$';
        this.fg = 'yellow';
        this.g = g;

        if (t) {
            Object.assign(this, t);

            this.char = itemChars[t.type];
            if (t.findamt) this.count = t.findamt(g);
        }
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
    domaru,
    hachimaki,
    sujibachi,
];

const itemChars = {
    [ItemType.Armour]: '[',
    [ItemType.Weapon]: ')',
};

function randomItemTemplate(g: Game) {
    while (true) {
        if (rnd(g.rng, 100) < ARTIFACT_CHANCE) return oneof(g.rng, artifacts);

        const item = oneof(g.rng, items);
        if (rnd(g.rng, 100) >= item.rarity) return item;
    }
}

function randomEnchant(g: Game, i: Item) {
    g.t.todo('randomEnchant', i);
}

export function constructItem(g: Game, template: ItemTemplate) {
    g.t.enter('constructItem', template);
    const item = new Item(g, template);

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
