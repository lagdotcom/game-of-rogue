import { ItemType } from '../types';
import { WeaponTemplate } from '../Item';

export const kusanagi: WeaponTemplate = {
    name: 'Kusanagi-no-Tsurugi',
    article: 'the',
    type: ItemType.Weapon,
    hands: 2,
    offhand: false,
    strength: 8,
    weight: 4,
    traits: { handle: true, blade: true, sword: true, legendary: true },
    movetimer: 1,
    missile: false,
    thrown: false,
    ammo: false,
    stacked: false,
    mods: {},
    listeners: {
        'player.attack': e => {
            // TODO
        },
    },
    rarity: 1,
};
