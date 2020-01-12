export enum Tile {
    Door = '+',
    Empty = ' ',
    Space = '.',
    Wall = '#',

    NotDoor = 'd',
    Enemy = 'E',
    Treasure = '$',
    Player = '@',
}

export interface Token {
    bg: string;
    char: string;
    fg: string;
}

export enum ItemType {
    Armour = '[',
    Weapon = ')',
    Other = '$',
}

export enum ItemSlot {
    Body = 'body',
    Head = 'head',
    Primary = 'primary',
    Secondary = 'secondary',
    BothHands = 'both',
}

export enum Dir {
    N,
    NE,
    E,
    SE,
    S,
    SW,
    W,
    NW,
}

export interface XY {
    x: number;
    y: number;
}

export type Mod = number;
export interface Mods {
    armour?: Mod;
    sightFov?: Mod;
}

export interface ItemTraits {
    arrow?: boolean;
    blade?: boolean;
    bow?: boolean;
    fist?: boolean;
    handle?: boolean;
    knife?: boolean;
    legendary?: boolean;
    missile?: boolean;
    point?: boolean;
    sword?: boolean;
    wood?: boolean;
}
