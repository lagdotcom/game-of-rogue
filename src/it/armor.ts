import { ArmourTemplate } from '../Item';
import { ItemSlot, ItemTraits, ItemType } from '../types';

function a({
    article = 'a',
    name,
    rarity = 1,
    slot,
    traits = {},
    armour,
    sightFov,
    weight = 0,
}: {
    article?: string;
    name: string;
    rarity?: number;
    slot: ItemSlot;
    traits?: ItemTraits;
    armour: number;
    sightFov?: number;
    weight?: number;
}): ArmourTemplate {
    return {
        name,
        article,
        type: ItemType.Armour,
        slot,
        armour,
        sightFov,
        weight,
        traits,
        rarity,
        stacked: false,
    };
}

export const doMaru: ArmourTemplate = a({
    name: 'dō-maru',
    slot: ItemSlot.Body,
    weight: 5,
    armour: 3,
});

export const hachimaki = a({
    name: 'hachimaki',
    slot: ItemSlot.Head,
    armour: 0,
});

export const sujiBachi = a({
    name: 'suji bachi',
    slot: ItemSlot.Head,
    weight: 2,
    armour: 1,
    sightFov: -20,
});
