import { ItemType, ItemSlot, ItemTemplate, Mods, ItemTraits } from '../types';

function a(i: {
    article?: string;
    mods?: Mods;
    name: string;
    rarity?: number;
    slot: ItemSlot;
    traits?: ItemTraits;
    weight?: number;
}): ItemTemplate {
    return {
        name: i.name,
        article: i.article || 'a',
        type: ItemType.Armour,
        slot: i.slot,
        mods: i.mods || {},
        weight: i.weight || 0,
        traits: i.traits || {},
        rarity: i.rarity || 1,
        stacked: false,
    };
}

export const domaru = a({
    name: 'dō-maru',
    slot: ItemSlot.Body,
    weight: 5,
    mods: { armour: 3 },
});

export const hachimaki = a({
    name: 'hachimaki',
    slot: ItemSlot.Head,
});

export const sujibachi = a({
    name: 'suji bachi',
    slot: ItemSlot.Head,
    weight: 2,
    mods: { armour: 1, sightFov: -20 },
});
