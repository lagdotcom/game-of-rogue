import Enchantment, { EnchantmentSlot } from './Enchantment';
import Game from './Game';
import Item from './Item';
import { keys, oneOf, rnd } from './tools';
import { ItemType } from './types';

const master: Enchantment = {
    name: 'of a master',
    slot: EnchantmentSlot.Suffix,
    type: ItemType.Armour,
    mods: new Map([['armour', 1]]),
};

const jadeHandled: Enchantment = {
    name: 'jade-handled',
    slot: EnchantmentSlot.Prefix,
    type: ItemType.Weapon,
    mods: new Map([['strength', 1]]),
    traits: { handle: true },
};

const gore: Enchantment = {
    name: 'of gore',
    slot: EnchantmentSlot.Suffix,
    type: ItemType.Weapon,
    mods: new Map([['strength', 1]]),
};

const featherLight: Enchantment = {
    name: 'feather-light',
    slot: EnchantmentSlot.Prefix,
    rarity: 50,
    mods: new Map([
        ['moveTimer', (x) => x * 0.9],
        ['weight', (x) => x * 0.9],
    ]),
};

const enchantments = [master, jadeHandled, gore, featherLight];

function isValidEnchantment(i: Item, e: Enchantment) {
    if (e.type && i.type !== e.type) return false;

    if (e.traits) {
        for (const tr of keys(e.traits)) {
            const presence = e.traits[tr];
            if (presence === true && !i.template.traits[tr]) return false;
            else if (presence === false && i.template.traits[tr]) return false;
        }
    }

    return true;
}

export function applyEnchant(i: Item, e: Enchantment) {
    i.enchantments.push(e);
}

export function randomEnchant(g: Game, i: Item) {
    const valid = enchantments.filter((e) => isValidEnchantment(i, e));
    if (!valid.length) {
        console.error(`No valid enchantments for ${i.name()}`);
        return false;
    }

    while (true) {
        const e = oneOf(g.rng, valid);

        if (rnd(g.rng, 100) >= (e.rarity || 1)) {
            applyEnchant(i, e);
            g.t.message('enchanted', i, e);
            return;
        }
    }
}
