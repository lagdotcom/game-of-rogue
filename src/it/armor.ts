import { ArmourTemplate } from '../Item';
import { RequireSome } from '../tools';
import { ItemSlot, ItemType } from '../types';

function a({
    article = 'a',
    rarity = 1,
    traits = {},
    weight = 0,
    ...etc
}: RequireSome<ArmourTemplate, 'name' | 'slot'>): ArmourTemplate {
    return {
        article,
        type: ItemType.Armour,
        weight,
        traits,
        rarity,
        stacked: false,
        ...etc,
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
