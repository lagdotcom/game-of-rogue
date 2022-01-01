import { ItemTraits, ItemType, Mods } from './types';

export enum EnchantmentSlot {
    Prefix,
    Suffix,
}

export default interface Enchantment {
    name: string;
    slot: EnchantmentSlot;
    mods: Mods;
    type?: ItemType;
    rarity?: number;
    traits?: ItemTraits;
}
