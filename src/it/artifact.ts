import { WeaponTemplate } from '../Item';
import { ItemType } from '../types';

export const kusanagi: WeaponTemplate = {
    name: 'Kusanagi-no-Tsurugi',
    article: 'the',
    type: ItemType.Weapon,
    hands: 2,
    offhand: false,
    power: 8,
    weight: 4,
    traits: { handle: true, blade: true, sword: true, legendary: true },
    moveTimer: 1,
    missile: false,
    thrown: false,
    ammo: false,
    stacked: false,
    listeners: {
        'player.attack': (e) => {
            // TODO
        },
    },
    rarity: 1,
};
