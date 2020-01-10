import Player from './Player';
import { Floor } from './Floor';
import Game from './Game';

export interface GameEventMap {
    'architect.begin': GameEvent;
    'architect.end': FloorEvent;
    'floor.enter': FloorEvent;
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
    visited: XY[];
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
    hpg: number;
    ki: number;
    kig: number;
    str: number;
    strg: number;
}
