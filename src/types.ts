import Player from './Player';
import { Floor } from './Floor';
import Game from './Game';
import Item from './Item';

export interface GameEventMap {
    'architect.begin': GameEvent;
    'architect.end': FloorEvent;
    'floor.enter': FloorEvent;
    'player.attack': AttackEvent;
    'player.move': PlayerEvent;
    'player.turn': PlayerEvent;
}

export interface GameEvent {}

export interface FloorEvent extends GameEvent {
    floor: Floor;
}

export interface PlayerEvent extends GameEvent {
    player: Player;
}

export interface AttackEvent extends GameEvent {
    attacker: Actor;
    victim: Actor;
    weapon: Item;
}

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
    isActor?: true;
    isEnemy?: true;
    isItem?: true;
    isPlayer?: true;
    bg: string;
    char: string;
    fg: string;
}

export interface Actor extends Token {
    isActor: true;
    balance: number;
    balanceMax: number;
    cloneOf?: Actor;
    facing: Dir;
    g: Game;
    hp: number;
    hpMax: number;
    ki: number;
    kiMax: number;
    name: string;
    nextmove: number;
    pos: XY;
    sightFov: number;
    sightRange: number;
    str: number;

    spend(t: number): void;
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

export interface Traceline {
    start: XY;
    projected: XY;
    end: XY;
    visited: Set<XY>;
    hit?: Actor;
}

export interface Skill {
    name: string;
    balance: number;
    ki: number;
    movetimer: number;
    fn: (a: Actor) => boolean;
}

export interface Class {
    name: string;
    skills: Skill[];
    hp: number;
    hpGain: number;
    ki: number;
    kiGain: number;
    str: number;
    strGain: number;
}

export enum ItemType {
    Armour,
    Weapon,
}

export enum ItemSlot {
    Body,
    Head,
    Primary,
    Secondary,
    BothHands,
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

export interface ItemTemplate {
    name: string;
    article: string;
    type: ItemType;
    slot?: ItemSlot;
    weight?: number;
    mods: Mods;
    rarity: number;
    stacked: boolean;
    findamt?: (g: Game) => number;
    traits: ItemTraits;
    listeners?: {
        [type in keyof GameEventMap]?: (e: GameEventMap[type]) => void;
    };
}

export interface WeaponTemplate extends ItemTemplate {
    type: ItemType.Weapon;
    hands: number;
    offhand: boolean;
    movetimer: number;
    strength: number;
    thrown: boolean;
    ammo: boolean;
    missile: boolean;
    firedBy?: ItemTraits;
}
