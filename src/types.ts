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
    energy: number;
    facing: Dir;
    fov: number;
    g: Game;
    pos: XY;
    sight: number;
}

export enum Dir {
    North,
    NorthEast,
    East,
    SouthEast,
    South,
    SouthWest,
    West,
    NorthWest,
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
