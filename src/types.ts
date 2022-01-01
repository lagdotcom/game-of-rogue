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

export type ModKey =
    | 'armour'
    | 'balanceMax'
    | 'balanceRegen'
    | 'hearingRange'
    | 'hpMax'
    | 'hpRegen'
    | 'kiMax'
    | 'kiRegen'
    | 'moveCost'
    | 'moveTimer'
    | 'power'
    | 'sightFov'
    | 'sightRange'
    | 'strength'
    | 'weight';
export type Mod = number | ((x: number) => number);
export type Mods = Map<ModKey, Mod>;

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

export enum Side {
    Player,
    Enemy,
}

export enum AIState {
    Passive,
    Investigating,
    Angry,
}

export interface AITraits {
    investigatesNoises?: boolean;
    yellsOnSight?: number;
}
